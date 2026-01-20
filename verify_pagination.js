const axios = require('axios');

const API_URL = 'http://localhost:5000/api/admin/properties';

async function testPagination() {
    console.log('Testing Default Behavior (No Params)...');
    try {
        const res1 = await axios.get(API_URL);
        if (Array.isArray(res1.data)) {
            console.log('PASS: Default behavior returns an array.');
            console.log(`Count: ${res1.data.length}`);
        } else {
            console.error('FAIL: Default behavior did not return an array.');
            console.log('Response type:', typeof res1.data);
        }
    } catch (e) {
        console.error('FAIL: Error fetching default:', e.message);
    }

    console.log('\nTesting Pagination (page=1, limit=2)...');
    try {
        const res2 = await axios.get(`${API_URL}?page=1&limit=2`);
        if (res2.data.data && Array.isArray(res2.data.data) && res2.data.meta) {
            console.log('PASS: Pagination returns data and meta.');
            console.log(`Page: ${res2.data.meta.page}, Limit: ${res2.data.meta.limit}, Total: ${res2.data.meta.total}`);
            console.log(`Data Length: ${res2.data.data.length}`);
        } else {
            console.error('FAIL: Pagination response structure incorrect.');
            console.log(JSON.stringify(res2.data, null, 2));
        }
    } catch (e) {
        console.error('FAIL: Error fetching paginated:', e.message);
    }
}

testPagination();
