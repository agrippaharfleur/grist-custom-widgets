# Grist Batch Email Widget

A custom widget for Grist that enables batch email composition with BCC recipients management. This widget allows you to easily compose emails to multiple recipients while maintaining privacy through BCC, with additional features for managing your recipient list.

[🔗 Try it here](https://docs.getgrist.com/6wF1LMEkA2J6/Custom-Widget-Portfolio/p/1)

## Features

- 📧 Compose emails to multiple recipients using BCC
- ✂️ Remove/restore recipients from the mailing list
- ➕ Manually add additional recipients
- 🔄 Real-time recipient count updates
- 👥 Separated lists for table contacts and manually added contacts
- 📝 Full email composition (reply-to, subject, content)
- 📨 Opens in your default email client for final review and sending

## Setup

1. Create a new custom widget in your Grist document
2. Copy the contents of `index.html` and `script.js` into your widget
3. Configure the widget to connect to a table column containing email addresses

## Usage

1. **Column Mapping**
   - Map your email column in the widget configuration
   - The widget will automatically load emails from the mapped column

2. **Managing Recipients**
   - Remove recipients by clicking the × button
   - Restore removed recipients from the "Removed Recipients" section
   - Add additional recipients manually using the input field

3. **Composing Email**
   - Enter your reply-to email address
   - Write your subject and content
   - Click "Compose Email" to open in your default email client
   - All recipients will be automatically added to BCC

4. **Filtering Recipients**
   - Apply filters to your table view to filter the recipient list
   - The widget will update automatically to reflect the filtered data
   - Always verify the recipient count matches your expectations

## Technical Details

The widget uses:
- Grist Plugin API for data interaction
- Native JavaScript for DOM manipulation
- `mailto:` protocol for email composition


## Contributing

Contributions are welcome! Feel free to submit issues and enhancement requests.

## Credits

- Created for the Grist community
- Design inspired by GitHub's UI components
- Built using Grist's Custom Widget Builder

## License

MIT License - feel free to use and modify for your needs.

---

*Built with ❤️ for the Grist community*