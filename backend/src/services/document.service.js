const prisma = require('../config/prisma');

class DocumentService {
    /**
     * Creates a document and automatically links it to related entities.
     * @param {Object} data - Document metadata and context IDs
     * @param {string} data.name - File name
     * @param {string} data.type - Document type (e.g. "LEASE", "ID")
     * @param {string} data.fileUrl - Storage URL/Path
     * @param {Date} [data.expiryDate] - Optional expiry date
     * @param {number} [data.userId] - Linked Tenant/User ID
     * @param {number} [data.unitId] - Linked Unit ID
     * @param {number} [data.leaseId] - Linked Lease ID
     * @param {number} [data.propertyId] - Linked Property ID
     * @param {number} [data.invoiceId] - Linked Invoice ID
     * @param {Array} [data.links] - Explicit links array [{ entityType, entityId }]
     */
    async createDocument(data) {
        const {
            name, type, fileUrl, expiryDate,
            userId, unitId, leaseId, propertyId, invoiceId,
            links = []
        } = data;

        // 1. Create the base Document record
        // We populate the legacy FK columns for backward compatibility.
        const document = await prisma.document.create({
            data: {
                name,
                type,
                fileUrl,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                userId: userId ? parseInt(userId) : null,
                unitId: unitId ? parseInt(unitId) : null,
                leaseId: leaseId ? parseInt(leaseId) : null,
                propertyId: propertyId ? parseInt(propertyId) : null,
                invoiceId: invoiceId ? parseInt(invoiceId) : null,
            }
        });

        const docId = document.id;
        const linksToCreate = [];

        // 2. Helper to add links without duplicates
        const addLink = (entityType, entityId) => {
            if (!entityId) return;
            const idVal = parseInt(entityId);
            if (isNaN(idVal)) return;

            const exists = linksToCreate.find(l => l.entityType === entityType && l.entityId === idVal);
            if (!exists) {
                linksToCreate.push({ documentId: docId, entityType, entityId: idVal });
            }
        };

        // 3. Add explicit links passed in arguments
        if (Array.isArray(links)) {
            links.forEach(l => addLink(l.entityType, l.entityId));
        }

        // 4. Add links derived from direct FKs
        if (userId) addLink('USER', userId);
        if (unitId) addLink('UNIT', unitId);
        if (leaseId) addLink('LEASE', leaseId);
        if (propertyId) addLink('PROPERTY', propertyId);
        if (invoiceId) addLink('INVOICE', invoiceId);

        // 5. INFER additional links (The "Multi-Link" magic)

        // If linked to a Lease, infer Tenant and Unit
        if (leaseId) {
            const lease = await prisma.lease.findUnique({ where: { id: parseInt(leaseId) } });
            if (lease) {
                if (lease.tenantId) addLink('USER', lease.tenantId);
                if (lease.unitId) addLink('UNIT', lease.unitId);
            }
        }

        // If linked to a Unit, infer Property
        if (unitId) {
            const unit = await prisma.unit.findUnique({
                where: { id: parseInt(unitId) },
                include: { property: true }
            });
            if (unit && unit.propertyId) {
                addLink('PROPERTY', unit.propertyId);
            }
        }

        // If linked to a User (Tenant), infer active Lease and Unit
        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: parseInt(userId) },
                include: { leases: { where: { status: 'Active' } } }
            });

            // Link to active lease if exists
            if (user && user.leases && user.leases.length > 0) {
                const activeLease = user.leases[0];
                addLink('LEASE', activeLease.id);
                addLink('UNIT', activeLease.unitId);
            }
        }

        // 6. Bulk create all collected links
        if (linksToCreate.length > 0) {
            await prisma.documentLink.createMany({
                data: linksToCreate
            });
        }

        return document;
    }

    /**
     * Manually links an existing document to an entity.
     */
    async linkDocument(documentId, entityType, entityId) {
        if (!documentId || !entityType || !entityId) return;

        // Check if exists using count to avoid throwing unique constraint errors if schema didn't enforce it (though createMany handles it mostly)
        // But preventing doubles is good.
        const existing = await prisma.documentLink.findFirst({
            where: {
                documentId: parseInt(documentId),
                entityType: entityType,
                entityId: parseInt(entityId)
            }
        });

        if (!existing) {
            await prisma.documentLink.create({
                data: {
                    documentId: parseInt(documentId),
                    entityType: entityType,
                    entityId: parseInt(entityId)
                }
            });
        }
    }

    /**
     * Deletes a document and its links.
     */
    async deleteDocument(id) {
        const docId = parseInt(id);

        // Delete links first
        await prisma.documentLink.deleteMany({ where: { documentId: docId } });

        // Delete document record
        await prisma.document.delete({ where: { id: docId } });
    }
}

module.exports = new DocumentService();
