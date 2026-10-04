# 🎫 Free Ticket Bot — Discord Ticket System

A complete Discord ticket bot built with **discord.js v14**, fully powered by **Slash Commands**, with multi-category ticket support, ticket claiming, automatic DM reminders, and full **HTML transcript logging**.

> 🆓 **Completely Free Project**
>
> 🚫 **This project is not for sale.**

## ✨ Features

* Fully slash-command driven:
  `/setup-tickets`, `/add-ticket-type`, `/remove-ticket-type`, `/list-ticket-types`, `/send-panel`, `/close`, `/add`, `/remove`, `/claim`, `/by`.
* **`/by` command** — a public command that can be used by anyone without special permissions. It displays the bot's author, license, and credits.
* **Multiple ticket categories/types** — such as Inquiry, Bug Report, Complaint, etc. Each type can have its own channel category and support role.
* A **dropdown select-menu panel** that lists all configured ticket types.
* Close button with a confirmation prompt.
* **`/claim` command** — allows support staff to claim a ticket and notify the ticket opener.
* **Automatic DM follow-up reminder** — if a support member replies and the ticket opener does not respond within 5 minutes, the bot sends them a DM reminder with a direct link to the ticket.
* Private ticket channels with properly scoped permissions for the ticket opener and the relevant support role.
* Prevents a member from opening more than one ticket of the same type at the same time.
* Generates a **full HTML transcript** containing messages, attachments, images, embeds, ticket type, and claimed-by information.
* Sends the transcript to the configured log channel when a ticket is closed.
* Per-guild settings are stored in `data/settings.json` — no external database is required.
* Automatically cleans up the ticket channel after the ticket is closed.

## 📦 Installation

Install the required dependencies:

```bash
npm install
```

## ⚙️ Configuration

1. Copy `.env.example` and create a new file named `.env`.

2. Fill in the following values:

   * `DISCORD_TOKEN`: Your Discord bot token from the Discord Developer Portal.
   * `BOT_OWNER_ID`: Your Discord user ID. This is optional. If configured, the bot will DM you whenever it encounters an unexpected or unhandled error.

3. When inviting the bot to your server, make sure it has the following permissions:

   * `Manage Channels`
   * `View Channels`
   * `Send Messages`
   * `Read Message History`
   * `Attach Files`
   * `Embed Links`

4. Enable the following **Privileged Gateway Intents** from:

   **Developer Portal → Bot**

   * `Server Members Intent`
   * `Message Content Intent`

## 🚀 Running the Bot

First, register the slash commands:

```bash
npm run deploy
```

Then start the bot:

```bash
npm start
```

## 🧭 Usage Guide

### 1. Set Up the Ticket System

Use:

```text
/setup-tickets
```

to configure the log channel where closed-ticket transcripts will be sent.

### 2. Add a Ticket Type

Use:

```text
/add-ticket-type
```

to create a new ticket type, such as:

* Inquiry
* Bug Report
* Complaint
* Support Request

You can configure:

* Ticket type name.
* Channel category.
* Support role.
* Optional description.
* Optional emoji.

You can configure up to **25 ticket types**.

### 3. View Ticket Types

Use:

```text
/list-ticket-types
```

to view all currently configured ticket types.

To remove a ticket type:

```text
/remove-ticket-type
```

### 4. Send the Ticket Panel

Use:

```text
/send-panel
```

to send the ticket panel to the desired channel.

The panel uses a **dropdown select menu** containing all configured ticket types.

If you modify your ticket types, run the command again to refresh the panel.

### 5. Open a Ticket

A member selects a ticket type from the dropdown menu.

The bot will automatically create a private ticket channel with the appropriate permissions for:

* The ticket opener.
* The support role assigned to that ticket type.
* The bot.

### 6. Ticket Commands

Inside a ticket channel, the following commands can be used:

```text
/add
```

Adds a member to the ticket.

```text
/remove
```

Removes a member from the ticket.

```text
/claim
```

Allows a support member to claim the ticket.

```text
/close
```

Closes the ticket and saves its transcript.

The ticket can also be closed using the:

```text
Close Ticket
```

button after confirming the action.

### 7. Automatic Reminder

When a support member sends a message inside a ticket, the bot starts a **5-minute timer**.

If the ticket opener does not respond within those 5 minutes, the bot sends them a DM reminder containing a direct link to the ticket.

The reminder is automatically cancelled when:

* The ticket opener replies.
* The ticket is closed.

## 📁 Project Structure

```text
free-ticket-bot/
├── commands/                    # Slash commands
│   ├── setup-tickets.js
│   ├── add-ticket-type.js
│   ├── remove-ticket-type.js
│   ├── list-ticket-types.js
│   ├── send-panel.js
│   ├── close.js
│   ├── add.js
│   ├── remove.js
│   ├── claim.js
│   └── by.js
│
├── events/                      # Discord.js event handlers
│   ├── ready.js
│   ├── interactionCreate.js
│   └── messageCreate.js
│
├── utils/                       # Utility functions
│   ├── db.js
│   ├── ticketManager.js
│   ├── transcript.js
│   └── reminderTracker.js
│
├── data/                        # Automatically generated per-guild settings
│
├── transcripts/                 # Local ticket transcript copies
│
├── index.js
├── deploy-commands.js
├── package.json
├── .env.example
└── LICENSE.md
```

# 🆓 Completely Free — Not for Sale

**Free Ticket Bot** is a completely free project created and maintained by **iaf1**.

> 🚫 **This project is not for sale.**

The following are not permitted:

* Selling the original project.
* Selling the source code.
* Selling a modified version of the project.
* Selling the project as a paid product.
* Repackaging the project or its source code for the purpose of selling it.
* Claiming ownership of the original project or its source code.

You may use and modify the project for **noncommercial purposes** under the [PolyForm Noncommercial License 1.0.0](./LICENSE.md), provided that the author's copyright and ownership information are retained. Any commercial use requires written permission from the owner.

## ⚠️ Disclaimer

This project is provided **"AS IS"**, without warranties of any kind, either express or implied.

**iaf1 is not responsible or liable for any damage, loss, errors, server issues, data loss, security issues, misuse, or any other consequences resulting from the use, modification, hosting, or operation of this project.**

You are fully responsible for:

* Configuring the bot.
* Running and hosting the bot.
* Modifying the source code.
* Bot permissions.
* How the bot is used.
* Any consequences resulting from the use of the project.

By using this project, you acknowledge and agree that you are fully responsible for your use, configuration, modification, and operation of the project.

## © Copyright

**Free Ticket Bot** — Copyright © 2026 **iaf1**.

All source code and files contained in this repository are created and owned by **iaf1**, unless explicitly stated otherwise.

* **Author / Owner:** iaf1
* **💬 Discord:** `iaf0`
* **🐙 GitHub:** https://github.com/iiaf1
* **📄 License:** [PolyForm Noncommercial 1.0.0](./LICENSE.md) — free for noncommercial use only

---

> © 2026 **iaf1**
>
> 🆓 Completely Free Project
> 🚫 Not for Sale
> ⚠️ Provided AS IS without warranty
> 🔒 All rights reserved by the author under the terms specified in this project.
