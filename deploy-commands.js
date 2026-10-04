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

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const { DISCORD_TOKEN } = process.env;

if (!DISCORD_TOKEN) {
    console.error('❌ تأكد من ضبط DISCORD_TOKEN في ملف .env');
    process.exit(1);
}

/** يستخرج Application/Client ID مباشرة من توكن البوت (نفس معرف المستخدم للبوت) */
function getClientIdFromToken(token) {
    try {
        const idPart = token.split('.')[0];
        return Buffer.from(idPart, 'base64').toString('utf-8');
    } catch {
        return null;
    }
}

const CLIENT_ID = getClientIdFromToken(DISCORD_TOKEN);

if (!CLIENT_ID) {
    console.error('❌ تعذّر استخراج CLIENT_ID من DISCORD_TOKEN. تأكد أن التوكن صحيح.');
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.warn(`⚠️ الملف ${file} ناقص خاصية data أو execute.`);
    }
}

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
    try {
        console.log(`🔄 جاري تسجيل ${commands.length} أمر سلاش بشكل عالمي...`);

        // تسجيل عالمي (قد يستغرق حتى ساعة للانتشار على كل السيرفرات)
        const data = await rest.put(Routes.applicationCommands(CLIENT_ID), {
            body: commands,
        });

        console.log(`✅ تم تسجيل ${data.length} أمر بنجاح بشكل عالمي (قد يستغرق الانتشار حتى ساعة).`);
    } catch (error) {
        console.error('❌ فشل تسجيل الأوامر:', error);
    }
})();
