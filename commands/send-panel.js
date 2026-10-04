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
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
} = require('discord.js');
const db = require('../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send-panel')
        .setDescription('إرسال لوحة فتح التذاكر (بقائمة اختيار الأنواع) في هذه القناة')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption((opt) =>
            opt.setName('العنوان').setDescription('عنوان لوحة التذاكر (اختياري)').setRequired(false)
        )
        .addStringOption((opt) =>
            opt.setName('الوصف').setDescription('وصف لوحة التذاكر (اختياري)').setRequired(false)
        ),

    async execute(interaction) {
        const settings = db.getGuildSettings(interaction.guild.id);

        if (!settings.logChannelId) {
            return interaction.reply({
                content: '❌ لازم تضبط روم السجلات أولاً بأمر `/setup-tickets`.',
                ephemeral: true,
            });
        }

        const types = db.getTicketTypes(interaction.guild.id);
        if (types.length === 0) {
            return interaction.reply({
                content: '❌ لا توجد أنواع تذاكر مُضافة بعد. أضف نوع واحد على الأقل بأمر `/add-ticket-type`.',
                ephemeral: true,
            });
        }

        const title = interaction.options.getString('العنوان') || '🎫 نظام الدعم الفني';
        const description =
            interaction.options.getString('الوصف') ||
            'اختر نوع طلبك من القائمة أدناه ليتم فتح تذكرة خاصة بك.';

        const panelEmbed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle(title)
            .setDescription(description)
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL() || undefined,
            })
            .setTimestamp();

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_ticket_type')
            .setPlaceholder('اختر نوع التذكرة...')
            .addOptions(
                types.map((t) => {
                    const option = {
                        label: t.label,
                        value: t.id,
                        description: t.description ? t.description.slice(0, 100) : undefined,
                    };
                    if (t.emoji) option.emoji = t.emoji;
                    return option;
                })
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.channel.send({ embeds: [panelEmbed], components: [row] });

        await interaction.reply({
            content: `✅ تم إرسال لوحة التذاكر بنجاح وفيها ${types.length} نوع.`,
            ephemeral: true,
        });
    },
};
