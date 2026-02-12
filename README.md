# Example iFrame implementation for wahl.chat

The hosted version of this example can be found on [https://embed-example.wahl.chat](https://embed-example.wahl.chat).

## How to implement the iFrame on your Website

**Required:**

- `tenant_id` - The ID of your tenant. We will provide you with this ID. If you don't have one, please contact us at [info@wahl.chat](mailto:info@wahl.chat).

**Optional:**

- `context_id` - The election context to open in the iFrame (for example `bundestagswahl-2025`).
- `party_id` - The IDs of the parties you want to display. You can pass up to 7 `party_id` parameters.
- Example URL for opening a specific context:
  - `https://wahl.chat/api/embed?tenant_id=[YOUR_TENANT_ID]&context_id=bundestagswahl-2025`
- Example URL for starting a conversation with the SPD:
  - `https://wahl.chat/api/embed?tenant_id=[YOUR_TENANT_ID]&context_id=bundestagswahl-2025&party_id=spd`
- Example URL for starting a conversation with the SPD and the CDU/CSU:
  - `https://wahl.chat/api/embed?tenant_id=[YOUR_TENANT_ID]&context_id=bundestagswahl-2025&party_id=spd&party_id=cdu`

- The `party_id` parameter is optional. If you don't pass it, the iFrame will open on the context landing page.
- The `context_id` parameter is optional. If you don't pass it, the default context is used.


**Note:**

- If you need help with generating the iFrame URL, use the [Example Website](https://embed-example.wahl.chat) to generate the URL.

### Example HTML implementation:

```html
<iframe 
  src="https://wahl.chat/api/embed?tenant_id=[YOUR_TENANT_ID]" 
  width="100%" 
  height="100%" 
/>
```

## Support

If you have any questions or need help with the implementation, please contact us at [info@wahl.chat](mailto:info@wahl.chat).
