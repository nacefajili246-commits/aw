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

const { Events, ActivityType } = require("discord.js");

// رابط البث (لازم يكون رابط Twitch أو YouTube صحيح عشان ديسكورد يعرض شارة "Streaming" الأرجوانية وزر Watch)
const STREAM_URL = "https://twitch.tv/discord";

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const commands = [...client.commands.values()].map((command) =>
            command.data.toJSON(),
        );
        let syncedCount = 0;

        for (const guild of client.guilds.cache.values()) {
            try {
                const synced = await guild.commands.set(commands);
                syncedCount += synced.size;
                console.log(
                    `✅ تم تسجيل ${synced.size} أمر في السيرفر ${guild.name}.`,
                );
            } catch (error) {
                console.error(
                    `❌ فشل تسجيل الأوامر في السيرفر ${guild.name}:`,
                    error.message,
                );
            }
        }

        console.log(
            `✅ ${client.user.tag} — تمت مزامنة ${syncedCount} أمر داخل السيرفرات.`,
        );
        client.user.setPresence({
            activities: [
                {
                    name: "by iaf0",
                    type: ActivityType.Streaming,
                    url: STREAM_URL,
                },
            ],
            status: "online",
        });
    },
};
