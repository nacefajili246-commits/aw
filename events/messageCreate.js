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

const { Events } = require('discord.js');
const db = require('../utils/db');
const { scheduleReminder, clearReminder } = require('../utils/reminderTracker');

const REMINDER_DELAY_MS = 5 * 60 * 1000; // 5 دقايق

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        const settings = db.getGuildSettings(message.guild.id);
        const ticketData = (settings.openTickets || {})[message.channel.id];
        if (!ticketData) return; // مو روم تذكرة، تجاهل

        // ===== صاحب التذكرة رد بنفسه -> ألغِ أي تذكير معلّق =====
        if (message.author.id === ticketData.userId) {
            clearReminder(message.channel.id);
            return;
        }

        const ticketType = db.getTicketTypeById(message.guild.id, ticketData.typeId);
        if (!ticketType) return;

        // ===== تحقق إن الكاتب من فريق الدعم المسؤول عن هذا النوع =====
        const member = message.member;
        if (!member || !member.roles.cache.has(ticketType.supportRoleId)) return;

        // فريق الدعم رد -> جدولة تذكير بعد 5 دقايق في حال ما رد صاحب التذكرة
        scheduleReminder(message.channel.id, REMINDER_DELAY_MS, async () => {
            try {
                const currentSettings = db.getGuildSettings(message.guild.id);
                const currentTicket = (currentSettings.openTickets || {})[message.channel.id];
                if (!currentTicket) return; // التذكرة انقفلت أو انحذفت قبل ما يفوت الوقت

                const openerUser = await message.client.users.fetch(currentTicket.userId).catch(() => null);
                if (!openerUser) return;

                const channelLink = `https://discord.com/channels/${message.guild.id}/${message.channel.id}`;

                await openerUser
                    .send({
                        content:
                            `🔔 الدعم الفني رد عليك في تذكرتك رقم #${currentTicket.ticketNumber ?? '-'} (${currentTicket.typeLabel || ''}).\n` +
                            `يرجى التوجه للتذكرة للمتابعة: ${channelLink}`,
                    })
                    .catch(() => {}); // تجاهل إذا كانت الخاص مقفلة عنده
            } catch (err) {
                console.error('[reminder] خطأ أثناء إرسال تذكير المتابعة:', err);
            }
        });
    },
};
