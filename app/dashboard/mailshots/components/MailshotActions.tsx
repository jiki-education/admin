"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/button/Button";
import { Badge } from "@/components/ui/badge/Badge";
import { sendMailshot, testMailshot } from "@/lib/api/mailshots";
import { isDraft, statusLabel } from "../status";
import { extractErrorMessage } from "../errors";
import SegmentSelector from "./SegmentSelector";
import SendConfirmModal from "./SendConfirmModal";
import { SEGMENTS } from "../types";
import type { Mailshot, Segment } from "../types";

function segmentLabel(segment: Segment): string {
  return SEGMENTS.find((s) => s.value === segment)?.label ?? segment;
}

interface MailshotActionsProps {
  mailshot: Mailshot;
  onUpdated: (mailshot: Mailshot) => void;
}

export default function MailshotActions({ mailshot, onUpdated }: MailshotActionsProps) {
  const [segment, setSegment] = useState<Segment | "">("");
  const [testing, setTesting] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      await testMailshot(mailshot.id);
      toast.success("Test sent to your inbox — this never counts toward a real send.");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setTesting(false);
    }
  };

  const handleConfirmSend = async () => {
    if (!segment) {
      return;
    }
    setSending(true);
    setSendError(null);
    try {
      const { mailshot: refreshed, audience_count: audienceCount } = await sendMailshot(mailshot.id, segment);
      onUpdated(refreshed);
      setConfirmOpen(false);
      toast.success(`Queued for ~${audienceCount} users (already-emailed users skipped automatically)`);
    } catch (err) {
      setSendError(extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Send</h3>
        <Badge color={isDraft(mailshot) ? "light" : "success"}>{statusLabel(mailshot)}</Badge>
      </div>

      <Button variant="outline" size="sm" onClick={handleTest} disabled={testing}>
        {testing ? "Sending test..." : "Send test to me"}
      </Button>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Audience</label>
          <SegmentSelector value={segment} onChange={setSegment} exclude={mailshot.sent_to_audiences} />
        </div>
        <Button variant="primary" onClick={() => setConfirmOpen(true)} disabled={!segment}>
          Send
        </Button>
      </div>

      {!isDraft(mailshot) && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Already sent to</p>
          <div className="flex flex-wrap gap-2">
            {mailshot.sent_to_audiences.map((s) => (
              <Badge key={s} variant="light" color="success">
                {segmentLabel(s)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {segment && confirmOpen && (
        <SendConfirmModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirmSend}
          mailshot={mailshot}
          segment={segment}
          loading={sending}
          error={sendError}
        />
      )}
    </div>
  );
}
