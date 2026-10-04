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
    ChannelType,
    PermissionsBitField,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');
const fs = require('fs');
const db = require('./db');
const { generateTranscriptAttachment } = require('./transcript');
const { clearReminder } = require('./reminderTracker');

/** ينشئ روم تذكرة جديد للعضو المحدد بحسب نوع التذكرة المختار، ويرجع الروم الناتج */
async function createTicketChannel(guild, member, typeId) {
    const settings = db.getGuildSettings(guild.id);

    if (!settings.logChannelId) {
        throw new Error('لم يتم إعداد روم السجلات بعد. استخدم أمر /setup-tickets أولاً.');
    }

    const ticketType = db.getTicketTypeById(guild.id, typeId);
    if (!ticketType) {
        throw new Error('نوع التذكرة هذا غير موجود، تواصل مع الإدارة.');
    }

    // امنع فتح أكثر من تذكرة مفتوحة لنفس العضو من نفس النوع
    const existing = Object.entries(settings.openTickets || {}).find(
        ([, data]) => data.userId === member.id && data.typeId === typeId
    );
    if (existing) {
        const existingChannel = guild.channels.cache.get(existing[0]);
        if (existingChannel) {
            return { channel: existingChannel, alreadyOpen: true };
        }
        db.removeOpenTicket(guild.id, existing[0]);
    }

    const ticketNumber = db.incrementTicketCounter(guild.id);
    const channelName = `ticket-${String(ticketNumber).padStart(4, '0')}`;

    const permissionOverwrites = [
        {
            id: guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
            id: member.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.AttachFiles,
            ],
        },
        {
            id: ticketType.supportRoleId,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.AttachFiles,
                PermissionsBitField.Flags.ManageMessages,
            ],
        },
        {
            id: guild.members.me.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.ManageChannels,
            ],
        },
    ];

    const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: ticketType.categoryId,
        permissionOverwrites,
        topic: `تذكرة رقم ${ticketNumber} | النوع: ${ticketType.label} | صاحب التذكرة: ${member.id}`,
    });

    db.addOpenTicket(guild.id, channel.id, {
        userId: member.id,
        openedAt: Date.now(),
        ticketNumber,
        typeId: ticketType.id,
        typeLabel: ticketType.label,
    });

    const welcomeEmbed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`تذكرة رقم #${ticketNumber} — ${ticketType.label}`)
        .setDescription(
            `أهلاً بك ${member} 👋\n\nفريق الدعم <@&${ticketType.supportRoleId}> سيقوم بمساعدتك في أقرب وقت.\nيرجى وصف مشكلتك أو طلبك بالتفصيل.`
        )
        .setFooter({ text: 'اضغط على زر الإغلاق أدناه عند الانتهاء' })
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('إغلاق التذكرة')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒')
    );

    await channel.send({
        content: `${member} | <@&${ticketType.supportRoleId}>`,
        embeds: [welcomeEmbed],
        components: [row],
    });

    return { channel, alreadyOpen: false, ticketNumber };
}

/** يغلق تذكرة: يولّد الترانسكريبت، يرسله للوق، ثم يحذف الروم */
async function closeTicket(channel, guild, closerUser, reason = 'لا يوجد سبب محدد') {
    clearReminder(channel.id); // ألغِ أي تذكير معلّق لهذه التذكرة

    const settings = db.getGuildSettings(guild.id);
    const ticketData = (settings.openTickets || {})[channel.id];

    let openerTag = 'غير معروف';
    if (ticketData?.userId) {
        try {
            const openerMember = await guild.members.fetch(ticketData.userId);
            openerTag = openerMember.user.tag;
        } catch {
            openerTag = `(غادر السيرفر) ${ticketData.userId}`;
        }
    }

    const { attachment, filePath } = await generateTranscriptAttachment(channel, {
        ticketNumber: ticketData?.ticketNumber,
        typeLabel: ticketData?.typeLabel,
        openerTag,
        closedByTag: closerUser.tag,
        claimedByTag: ticketData?.claimedByTag,
        reason,
    });

    try {
        if (settings.logChannelId) {
            const logChannel = guild.channels.cache.get(settings.logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor(0xed4245)
                    .setTitle(`تم إغلاق التذكرة #${ticketData?.ticketNumber ?? '-'}`)
                    .addFields(
                        { name: 'اسم الروم', value: `#${channel.name}`, inline: true },
                        { name: 'نوع التذكرة', value: ticketData?.typeLabel || 'غير معروف', inline: true },
                        { name: 'صاحب التذكرة', value: openerTag, inline: true },
                        { name: 'أُغلقت بواسطة', value: closerUser.tag, inline: true },
                        { name: 'السبب', value: reason || 'لا يوجد' }
                    )
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed], files: [attachment] });
            }
        }
    } finally {
        // نظّف ملف الترانسكريبت المؤقت من القرص بعد إرساله (أو حتى لو فشل الإرسال)
        fs.unlink(filePath, () => {});
    }

    db.removeOpenTicket(guild.id, channel.id);

    setTimeout(() => {
        channel.delete('تم إغلاق التذكرة').catch(() => {});
    }, 5000);
}

module.exports = { createTicketChannel, closeTicket };
