# Row Counter Widget for Grist

A clean, minimalist widget for Grist that displays the total number of rows in your table, styled using GitHub's design system. Perfect for dashboards and quick data overviews.

![Demo here](https://docs.getgrist.com/6wF1LMEkA2J6/Custom-Widget-Portfolio/p/2)

## Features

- 🔢 Live row count updates
- 💡 Hover tooltip for additional information
- 📊 Automatic number formatting for large values

## Installation

1. In your Grist document, click on "Add New" and select "Custom Widget"
2. Add two files to your widget:
   - `row-counter.html`: Contains the widget's structure and styling
   - `row-counter.js`: Contains the widget's logic

Copy the contents of each file from this repository into your widget.

## Customization

### Changing Colors

The widget uses GitHub's color system with CSS variables. The two most important variables for customizing the widget's appearance are:

```css
/* Key customization variables */
:root {
    --color-neutral-muted: #f6f8fa;  /* Main widget background color */
    --color-neutral-subtle: #eaeef2;  /* Hover state color */
}
```

Additional color variables available for further customization:
```css
:root {
    --color-canvas-default: #ffffff;  /* Container background */
    --color-border-default: #d0d7de;  /* Border color */
    --color-fg-default: #24292f;      /* Main text color */
    --color-fg-muted: #57606a;        /* Secondary text color */
}
```

### Modifying the Tooltip

To change the tooltip text, locate this section in the CSS and modify the `content` property:

```css
.tooltip:after {
    content: "Total number of rows in the table";
    /* Other tooltip styles... */
}
```

## Credits

- Design inspired by GitHub's design system
- Built for the Grist community

---

Made with ❤️ for the Grist community