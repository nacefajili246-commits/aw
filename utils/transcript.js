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

const fs = require('fs');
const path = require('path');
const { AttachmentBuilder } = require('discord.js');

/** يهرّب أي رموز HTML خطرة من نص الرسالة */
function escapeHtml(str = '') {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

/** يجلب كل رسائل القناة (بترتيب زمني تصاعدي) عبر عدة طلبات fetch */
async function fetchAllMessages(channel) {
    let allMessages = [];
    let lastId;

    while (true) {
        const options = { limit: 100 };
        if (lastId) options.before = lastId;

        const batch = await channel.messages.fetch(options);
        if (batch.size === 0) break;

        allMessages = allMessages.concat(Array.from(batch.values()));
        lastId = batch.last().id;

        if (batch.size < 100) break;
    }

    // الرسائل تُجلب من الأحدث للأقدم، نعكسها لتصبح تصاعدية
    return allMessages.reverse();
}

/** يبني ملف HTML لترانسكريبت التذكرة ويرجع مساره الكامل على القرص */
async function generateTranscript(channel, ticketMeta = {}) {
    const messages = await fetchAllMessages(channel);

    const rows = messages.map((msg) => {
        const author = escapeHtml(msg.author?.tag || 'مستخدم غير معروف');
        const avatar = msg.author?.displayAvatarURL({ extension: 'png', size: 64 }) || '';
        const timestamp = new Date(msg.createdTimestamp).toLocaleString('ar-SA', {
            timeZone: 'Asia/Riyadh',
        });
        const content = escapeHtml(msg.content || '');

        const attachments = msg.attachments.size
            ? Array.from(msg.attachments.values())
                  .map((att) => {
                      const isImage = /\.(png|jpe?g|gif|webp)$/i.test(att.name || '');
                      const url = escapeHtml(att.url);
                      if (isImage) {
                          return `<div class="attachment"><img src="${url}" alt="attachment"/></div>`;
                      }
                      return `<div class="attachment"><a href="${url}" target="_blank">${escapeHtml(att.name || 'مرفق')}</a></div>`;
                  })
                  .join('')
            : '';

        const embeds = msg.embeds.length
            ? msg.embeds
                  .map((e) => {
                      const title = escapeHtml(e.title || '');
                      const desc = escapeHtml(e.description || '');
                      return `<div class="embed">${title ? `<div class="embed-title">${title}</div>` : ''}${desc ? `<div class="embed-desc">${desc}</div>` : ''}</div>`;
                  })
                  .join('')
            : '';

        return `
        <div class="message">
            <img class="avatar" src="${avatar}" alt="avatar"/>
            <div class="msg-body">
                <div class="msg-header">
                    <span class="author">${author}</span>
                    <span class="time">${timestamp}</span>
                </div>
                <div class="content">${content}</div>
                ${attachments}
                ${embeds}
            </div>
        </div>`;
    });

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<title>ترانسكريبت التذكرة - ${escapeHtml(channel.name)}</title>
<style>
    body {
        background: #313338;
        color: #dbdee1;
        font-family: 'Segoe UI', Tahoma, sans-serif;
        margin: 0;
        padding: 20px;
    }
    .header {
        background: #2b2d31;
        padding: 16px 20px;
        border-radius: 8px;
        margin-bottom: 20px;
    }
    .header h1 { margin: 0 0 8px 0; font-size: 20px; }
    .header p { margin: 2px 0; color: #949ba4; font-size: 13px; }
    .message {
        display: flex;
        gap: 12px;
        padding: 8px 4px;
        border-bottom: 1px solid #3f4147;
    }
    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        flex-shrink: 0;
    }
    .msg-header { display: flex; gap: 8px; align-items: baseline; }
    .author { font-weight: 600; color: #f2f3f5; }
    .time { font-size: 11px; color: #949ba4; }
    .content { white-space: pre-wrap; word-break: break-word; margin-top: 2px; }
    .attachment img { max-width: 320px; border-radius: 6px; margin-top: 6px; }
    .attachment a { color: #00a8fc; }
    .embed {
        border-right: 3px solid #5865f2;
        background: #2b2d31;
        padding: 8px 12px;
        margin-top: 6px;
        border-radius: 4px;
        max-width: 500px;
    }
    .embed-title { font-weight: 700; margin-bottom: 4px; }
</style>
</head>
<body>
    <div class="header">
        <h1>سجل تذكرة: #${escapeHtml(channel.name)}</h1>
        <p>رقم التذكرة: ${escapeHtml(String(ticketMeta.ticketNumber ?? '-'))}</p>
        <p>نوع التذكرة: ${escapeHtml(ticketMeta.typeLabel || '-')}</p>
        <p>صاحب التذكرة: ${escapeHtml(ticketMeta.openerTag || '-')}</p>
        <p>استلمها: ${escapeHtml(ticketMeta.claimedByTag || 'لم تُستلم')}</p>
        <p>أُغلقت بواسطة: ${escapeHtml(ticketMeta.closedByTag || '-')}</p>
        <p>سبب الإغلاق: ${escapeHtml(ticketMeta.reason || 'لا يوجد')}</p>
        <p>تاريخ الإغلاق: ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}</p>
        <p>عدد الرسائل: ${messages.length}</p>
    </div>
    ${rows.join('\n') || '<p>لا توجد رسائل في هذه التذكرة.</p>'}
</body>
</html>`;

    const dir = path.join(__dirname, '..', 'transcripts');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `transcript-${channel.id}-${Date.now()}.html`);
    fs.writeFileSync(filePath, html, 'utf-8');

    return filePath;
}

/** يبني AttachmentBuilder جاهز للإرسال مباشرة من ملف الترانسكريبت */
async function generateTranscriptAttachment(channel, ticketMeta = {}) {
    const filePath = await generateTranscript(channel, ticketMeta);
    const attachment = new AttachmentBuilder(filePath, {
        name: `transcript-${channel.name}.html`,
    });
    return { attachment, filePath };
}

module.exports = {
    fetchAllMessages,
    generateTranscript,
    generateTranscriptAttachment,
};
