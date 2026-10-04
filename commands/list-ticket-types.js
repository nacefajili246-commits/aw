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

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-ticket-types')
        .setDescription('عرض كل أنواع التذاكر المُعرّفة حالياً بالسيرفر')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const types = db.getTicketTypes(interaction.guild.id);

        if (types.length === 0) {
            return interaction.reply({
                content: '📭 لا توجد أنواع تذاكر مُضافة بعد. استخدم `/add-ticket-type` لإضافة أول نوع.',
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle('📋 أنواع التذاكر الحالية')
            .setDescription(
                types
                    .map((t, i) => {
                        const category = interaction.guild.channels.cache.get(t.categoryId);
                        return `**${i + 1}. ${t.emoji ? t.emoji + ' ' : ''}${t.label}**\n` +
                            `> التصنيف: ${category ? category.name : 'محذوف'}\n` +
                            `> رتبة الدعم: <@&${t.supportRoleId}>\n` +
                            `> الوصف: ${t.description || '-'}`;
                    })
                    .join('\n\n')
            )
            .setFooter({ text: `${types.length} نوع مُضاف` });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
