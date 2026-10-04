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
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');
const { createTicketChannel, closeTicket } = require('../utils/ticketManager');
const db = require('../utils/db');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            // ===== الإكمال التلقائي (Autocomplete) =====
            if (interaction.isAutocomplete()) {
                const command = interaction.client.commands.get(interaction.commandName);
                if (!command || !command.autocomplete) return;
                await command.autocomplete(interaction);
                return;
            }

            // ===== أوامر السلاش =====
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);
                if (!command) return;
                await command.execute(interaction);
                return;
            }

            // ===== قائمة اختيار نوع التذكرة =====
            if (interaction.isStringSelectMenu() && interaction.customId === 'select_ticket_type') {
                await interaction.deferReply({ ephemeral: true });

                const typeId = interaction.values[0];

                try {
                    const { channel, alreadyOpen } = await createTicketChannel(
                        interaction.guild,
                        interaction.member,
                        typeId
                    );

                    await interaction.editReply({
                        content: alreadyOpen
                            ? `لديك بالفعل تذكرة مفتوحة من هذا النوع: ${channel}`
                            : `✅ تم فتح تذكرتك: ${channel}`,
                    });
                } catch (err) {
                    await interaction.editReply({
                        content: `❌ حدث خطأ: ${err.message}`,
                    });
                }
                return;
            }

            // ===== زر: طلب إغلاق التذكرة (يعرض تأكيد) =====
            if (interaction.isButton() && interaction.customId === 'close_ticket') {
                const confirmEmbed = new EmbedBuilder()
                    .setColor(0xfee75c)
                    .setDescription('⚠️ هل أنت متأكد من رغبتك بإغلاق هذه التذكرة؟');

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirm_close')
                        .setLabel('تأكيد الإغلاق')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('cancel_close')
                        .setLabel('إلغاء')
                        .setStyle(ButtonStyle.Secondary)
                );

                await interaction.reply({ embeds: [confirmEmbed], components: [row] });
                return;
            }

            // ===== زر: تأكيد الإغلاق =====
            if (interaction.isButton() && interaction.customId === 'confirm_close') {
                const settings = db.getGuildSettings(interaction.guild.id);
                const isTicket = Object.prototype.hasOwnProperty.call(
                    settings.openTickets || {},
                    interaction.channel.id
                );

                if (!isTicket) {
                    return interaction.update({
                        content: '❌ هذه التذكرة غير موجودة في السجل، لا يمكن إغلاقها تلقائياً.',
                        embeds: [],
                        components: [],
                    });
                }

                await interaction.update({
                    content: '🔒 جاري إغلاق التذكرة وحفظ السجل... سيتم حذف الروم خلال ثوانٍ.',
                    embeds: [],
                    components: [],
                });

                await closeTicket(
                    interaction.channel,
                    interaction.guild,
                    interaction.user,
                    'أُغلقت عبر الزر'
                );
                return;
            }

            // ===== زر: إلغاء الإغلاق =====
            if (interaction.isButton() && interaction.customId === 'cancel_close') {
                await interaction.update({
                    content: '✅ تم إلغاء عملية الإغلاق.',
                    embeds: [],
                    components: [],
                });
                return;
            }
        } catch (error) {
            console.error('[interactionCreate] خطأ:', error);
            const errorPayload = {
                content: '❌ حدث خطأ غير متوقع أثناء تنفيذ هذا الإجراء.',
                ephemeral: true,
            };
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp(errorPayload).catch(() => {});
            } else {
                await interaction.reply(errorPayload).catch(() => {});
            }
        }
    },
};
