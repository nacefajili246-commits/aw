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

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const AUTHOR_DISCORD = 'iaf0';
const AUTHOR_GITHUB = 'https://github.com/iiaf1';
const LICENSE_YEAR = 2026;
const LICENSE_HOLDER = 'iaf1';

module.exports = {
    // بدون setDefaultMemberPermissions => الأمر عام ومتاح لأي شخص في أي سيرفر
    data: new SlashCommandBuilder()
        .setName('by')
        .setDescription('عرض معلومات المطوّر وحقوق الملكية والترخيص الخاصة بهذا البوت'),

    async execute(interaction) {
        const botName = interaction.client.user.username;

        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle(`© ${botName}`)
            .setDescription(
                'مشروع مجاني بالكامل وغير قابل للبيع.\n' +
                    `جميع الأكواد والملفات (بما فيها تصميم البوت) من تأليف وملكية ${LICENSE_HOLDER}، ما لم يُذكر خلاف ذلك صراحةً.`
            )
            .addFields(
                {
                    name: '👤 المؤلف / المالك',
                    value: `💬 Discord: \`${AUTHOR_DISCORD}\`\n🐙 GitHub: [${AUTHOR_GITHUB.replace('https://', '')}](${AUTHOR_GITHUB})`,
                },
                {
                    name: '📄 الرخصة',
                    value:
                        'PolyForm Noncommercial 1.0.0 — مجاني للاستخدام غير التجاري فقط. ' +
                        'لا يجوز بيع المشروع أو كوده أو أي نسخة معدّلة منه، ولا استخدامه تجارياً بدون إذن كتابي من المالك. ' +
                        'يجب إبقاء إشعار حقوق الملكية مرفقاً مع أي نسخة أو جزء من الكود.',
                },
                {
                    name: '⚠️ إخلاء المسؤولية',
                    value:
                        'المشروع مقدَّم "كما هو" بدون أي ضمانات. المالك غير مسؤول عن أي أضرار أو خسائر ' +
                        'أو فقدان بيانات أو سوء استخدام، والمستخدم هو المسؤول الوحيد عن استخدامه وإعداده وتعديله.',
                }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
            .setFooter({ text: `© ${LICENSE_YEAR} ${LICENSE_HOLDER} — PolyForm Noncommercial 1.0.0 — Free & Not for Sale` });

        await interaction.reply({ embeds: [embed] });
    },
};
