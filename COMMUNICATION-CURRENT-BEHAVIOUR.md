# What the App Is Doing Currently – In-App Messaging (Communication)

This describes how in-app messaging works today and why it can look like “nothing goes through or shows up.”

---

## Current flow

1. **Admin opens Communication**  
   - The app loads the list of people (tenants and owners) from the backend.  
   - Residents are also in the list, but the backend does **not** store or return message history for residents.

2. **Admin selects someone and types a message**  
   - When you click **Send**, the app:
     - Sends a **POST** request to the backend: “Create a message from me (admin) to this person.”
     - The backend saves the message in the database and returns success.
     - The app then **reloads the conversation** (GET history) so the new message should appear in the list.

3. **What you see**  
   - If the send **succeeds**: the input clears and the conversation list refreshes; the new message should show up.  
   - If the send **fails**: the app only logs the error in the browser console. It does **not** show any message, toast, or alert to you. So from your point of view, nothing happens: the message doesn’t appear and you’re not told why.

---

## Why it can seem like “nothing goes through or shows up”

1. **Errors are not shown in the UI**  
   When the send request fails (e.g. network, 401, 500, validation), the code only runs `console.error(error)`. There is no on-screen message like “Message could not be sent” or “Session expired.” So you don’t get feedback; it just looks like nothing happened.

2. **Residents are not fully supported for messaging**  
   - In the UI you can select a **resident** in the list.  
   - In the backend, messaging is built for **tenants and owners** (numeric user IDs). Residents are identified with IDs like `resident_123`.  
   - The backend turns the selected person’s ID into a number. For a resident, that becomes invalid, so:
     - Sending a message to a resident can fail or not be stored correctly.
     - Loading history for a resident can return empty or wrong data.  
   So if you’re trying to send or view messages with a **resident** selected, the app is not designed to support that yet; it can fail without telling you.

3. **Auth / token**  
   The send request uses your login token. If the token is missing or expired, the backend can respond with 401. Again, the app doesn’t show that to you; it only logs it, so it looks like nothing happened.

4. **Wrong backend URL**  
   The frontend is configured to call a specific backend URL (e.g. `http://localhost:5000`). If the frontend is opened from another URL (e.g. production) but still points to localhost, or the backend is down, the request fails and, again, you get no on-screen explanation.

---

## Summary

- **Technically:** The app **does** have in-app messaging: it calls the backend to send a message and then reloads the conversation. When the backend accepts the request and you’re chatting with a **tenant or owner** (not a resident), messages can send and show up.
- **From your perspective:** It can look like “nothing goes through or shows up” because:  
  - Failures are only logged, not shown in the UI.  
  - Selecting a **resident** is not properly supported and can fail silently.  
  - Auth or connectivity issues also fail without user-visible feedback.

So the gap is: **the app is doing the send/history flow, but it doesn’t tell you when something goes wrong, and resident messaging isn’t properly supported.**
