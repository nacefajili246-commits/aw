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

const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
} = require("discord.js");
const db = require("../utils/db");

const MAX_TICKET_TYPES = 25; // حد Discord لعدد خيارات القائمة المنسدلة

module.exports = {
    data: new SlashCommandBuilder()
        .setName("add-ticket-type")
        .setDescription(
            "إضافة نوع تذكرة جديد (مثل: استفسار، مشكلة، شكوى) للوحة الاختيار",
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption((opt) =>
            opt
                .setName("الاسم")
                .setDescription(
                    "اسم نوع التذكرة كما سيظهر بالقائمة (مثال: استفسار)",
                )
                .setRequired(true)
                .setMaxLength(80),
        )
        .addChannelOption((opt) =>
            opt
                .setName("التصنيف")
                .setDescription(
                    "التصنيف (Category) الذي ستُنشأ بداخله رومات هذا النوع",
                )
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true),
        )
        .addRoleOption((opt) =>
            opt
                .setName("رتبة-الدعم")
                .setDescription(
                    "الرتبة التي سترى وتستطيع الرد على هذا النوع من التذاكر",
                )
                .setRequired(true),
        )
        .addStringOption((opt) =>
            opt
                .setName("الوصف")
                .setDescription(
                    "وصف قصير يظهر تحت اسم النوع بالقائمة (اختياري)",
                )
                .setRequired(false)
                .setMaxLength(100),
        )
        .addStringOption((opt) =>
            opt
                .setName("ايموجي")
                .setDescription(
                    "إيموجي يظهر بجانب اسم النوع (اختياري، مثال: ❓)",
                )
                .setRequired(false),
        ),

    async execute(interaction) {
        const settings = db.getGuildSettings(interaction.guild.id);
        const currentTypes = settings.ticketTypes || [];

        if (currentTypes.length >= MAX_TICKET_TYPES) {
            return interaction.reply({
                content: `❌ وصلت للحد الأقصى (${MAX_TICKET_TYPES} نوع). احذف نوع قديم أولاً بأمر \`/remove-ticket-type\`.`,
                ephemeral: true,
            });
        }

        const label = interaction.options.getString("الاسم");
        const category = interaction.options.getChannel("التصنيف");
        const supportRole = interaction.options.getRole("رتبة-الدعم");
        const description = interaction.options.getString("الوصف") || "";
        const emoji = interaction.options.getString("ايموجي") || null;

        if (currentTypes.some((t) => t.label === label)) {
            return interaction.reply({
                content: `❌ يوجد نوع تذكرة بنفس الاسم "${label}" مسبقاً.`,
                ephemeral: true,
            });
        }

        const newType = db.addTicketType(interaction.guild.id, {
            label,
            emoji,
            description,
            categoryId: category.id,
            supportRoleId: supportRole.id,
        });

        await interaction.reply({
            content:
                `✅ تمت إضافة نوع التذكرة **${newType.label}** ${emoji || ""}\n` +
                `- التصنيف: ${category}\n` +
                `- رتبة الدعم: ${supportRole}\n\n` +
                `لا تنسَ إرسال/تحديث اللوحة بأمر \`/send-panel\` بعد ما تخلص إضافة كل الأنواع.`,
            ephemeral: true,
        });
    },
};
