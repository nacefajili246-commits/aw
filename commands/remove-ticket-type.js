/**
 * ============================================================
 *  Free Ticket Bot
 *  حقوق الملكية © 2026 iaf1 — جميع الحقوق محفوظة.
 *  Copyright © 2026 iaf1 — All rights reserved.
 * ============================================================
 *
 * [AR] إشعار المشروع:
 *  - هذا المشروع مجاني بالكامل.
 *  - هذا المشروع غير قابل للبيع، ولا يجوز بيعه أو بيع كوده أو أي نسخة معدّلة منه.
 *  - يجب الإبقاء على إشعار حقوق الملكية هذا في أي نسخة أو جزء من الكود.
 *  - الرخصة: PolyForm Noncommercial 1.0.0 (استخدام غير تجاري فقط) — راجع LICENSE.md.
 *
 * [AR] إخلاء المسؤولية:
 *  هذا الملف مقدَّم "كما هو" (AS IS) بدون أي ضمانات من أي نوع.
 *  المالك (iaf1) غير مسؤول عن أي أضرار أو خسائر أو مشاكل في السيرفر
 *  أو فقدان بيانات أو ثغرات أمنية أو سوء استخدام ناتج عن استخدام هذا الكود
 *  أو تعديله أو استضافته. المستخدم هو المسؤول الوحيد عن استخدامه.
 *
 * [EN] Project Notice:
 *  - This project is completely free.
 *  - This project is NOT for sale. Selling it, its source code, or any
 *    modified version of it is not permitted by the owner.
 *  - This copyright notice must be retained in all copies and derivatives.
 *  - License: PolyForm Noncommercial 1.0.0 (noncommercial use only) — see LICENSE.md.
 *
 * [EN] Disclaimer:
 *  This file is provided "AS IS", without warranty of any kind. The owner
 *  (iaf1) is not liable for any damage, loss, server issues, data loss,
 *  security issues, or misuse resulting from the use, modification, or
 *  hosting of this code. The user is solely responsible for its use.
 *
 * Contact / للتواصل:
 *  Discord: iaf0
 *  GitHub:  https://github.com/iiaf1
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-ticket-type')
        .setDescription('حذف نوع تذكرة موجود من لوحة الاختيار')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption((opt) =>
            opt
                .setName('الاسم')
                .setDescription('اسم نوع التذكرة المراد حذفه (كما هو مكتوب بالضبط)')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        const focused = interaction.options.getFocused().toLowerCase();
        const types = db.getTicketTypes(interaction.guild.id);
        const filtered = types
            .filter((t) => t.label.toLowerCase().includes(focused))
            .slice(0, 25)
            .map((t) => ({ name: t.label, value: t.label }));
        await interaction.respond(filtered);
    },

    async execute(interaction) {
        const label = interaction.options.getString('الاسم');
        const removed = db.removeTicketType(interaction.guild.id, label);

        if (!removed) {
            return interaction.reply({
                content: `❌ ما لقيت نوع تذكرة باسم "${label}".`,
                ephemeral: true,
            });
        }

        await interaction.reply({
            content: `✅ تم حذف نوع التذكرة "${label}". لا تنسَ تحديث اللوحة بأمر \`/send-panel\`.`,
            ephemeral: true,
        });
    },
};
