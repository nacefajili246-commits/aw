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
const crypto = require('crypto');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'settings.json');

function ensureDB() {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2), 'utf-8');
}

function readDB() {
    ensureDB();
    try {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(raw || '{}');
    } catch (err) {
        console.error('[DB] خطأ أثناء قراءة قاعدة البيانات:', err);
        return {};
    }
}

function writeDB(data) {
    ensureDB();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

/** يرجع إعدادات السيرفر، أو كائن افتراضي إن لم توجد */
function getGuildSettings(guildId) {
    const db = readDB();
    return db[guildId] || {
        logChannelId: null,
        ticketCounter: 0,
        ticketTypes: [], // [{ id, label, emoji, description, categoryId, supportRoleId }]
        openTickets: {} // channelId -> { userId, openedAt, ticketNumber, typeId, typeLabel }
    };
}

function setGuildSettings(guildId, settings) {
    const db = readDB();
    db[guildId] = { ...getGuildSettings(guildId), ...settings };
    writeDB(db);
    return db[guildId];
}

function addOpenTicket(guildId, channelId, ticketData) {
    const db = readDB();
    if (!db[guildId]) db[guildId] = getGuildSettings(guildId);
    if (!db[guildId].openTickets) db[guildId].openTickets = {};
    db[guildId].openTickets[channelId] = ticketData;
    writeDB(db);
}

function removeOpenTicket(guildId, channelId) {
    const db = readDB();
    if (db[guildId] && db[guildId].openTickets) {
        delete db[guildId].openTickets[channelId];
        writeDB(db);
    }
}

function incrementTicketCounter(guildId) {
    const db = readDB();
    if (!db[guildId]) db[guildId] = getGuildSettings(guildId);
    db[guildId].ticketCounter = (db[guildId].ticketCounter || 0) + 1;
    writeDB(db);
    return db[guildId].ticketCounter;
}

/** يرجع كل أنواع التذاكر المُعرّفة لهذا السيرفر */
function getTicketTypes(guildId) {
    const settings = getGuildSettings(guildId);
    return settings.ticketTypes || [];
}

/** يضيف نوع تذكرة جديد ويرجعه (مع id فريد) */
function addTicketType(guildId, typeData) {
    const db = readDB();
    if (!db[guildId]) db[guildId] = getGuildSettings(guildId);
    if (!db[guildId].ticketTypes) db[guildId].ticketTypes = [];

    const newType = {
        id: crypto.randomUUID(),
        label: typeData.label,
        emoji: typeData.emoji || null,
        description: typeData.description || '',
        categoryId: typeData.categoryId,
        supportRoleId: typeData.supportRoleId,
    };

    db[guildId].ticketTypes.push(newType);
    writeDB(db);
    return newType;
}

/** يحذف نوع تذكرة بواسطة id أو label (يرجع true إذا حُذف) */
function removeTicketType(guildId, idOrLabel) {
    const db = readDB();
    if (!db[guildId] || !db[guildId].ticketTypes) return false;

    const before = db[guildId].ticketTypes.length;
    db[guildId].ticketTypes = db[guildId].ticketTypes.filter(
        (t) => t.id !== idOrLabel && t.label !== idOrLabel
    );
    writeDB(db);
    return db[guildId].ticketTypes.length < before;
}

function getTicketTypeById(guildId, typeId) {
    const types = getTicketTypes(guildId);
    return types.find((t) => t.id === typeId) || null;
}

module.exports = {
    getGuildSettings,
    setGuildSettings,
    addOpenTicket,
    removeOpenTicket,
    incrementTicketCounter,
    getTicketTypes,
    addTicketType,
    removeTicketType,
    getTicketTypeById,
};
