import Swal from "sweetalert2";
import type { BulkAssignMembershipResult } from "@/services/membershipService";

/**
 * Escape HTML for SweetAlert HTML content.
 *
 * @param text - Raw string.
 */
export function escapeHtmlForDialog(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Show bulk membership assignment result in a confirmation dialog.
 *
 * @param result - Assignment outcome per user.
 * @param planName - Plan that was assigned.
 */
export async function showBulkAssignMembershipResultDialog(
  result: BulkAssignMembershipResult,
  planName: string
): Promise<void> {
  const { succeeded, failed } = result;
  const allFailed = succeeded.length === 0 && failed.length > 0;
  const allSucceeded = failed.length === 0;

  const failedList = failed
    .map(
      (f) =>
        `<li class="mb-1"><strong>${escapeHtmlForDialog(f.userName)}</strong>: ${escapeHtmlForDialog(f.error)}</li>`
    )
    .join("");

  const succeededList = succeeded
    .map((s) => `<li class="mb-1">${escapeHtmlForDialog(s.userName)}</li>`)
    .join("");

  let html = "";
  if (failed.length > 0) {
    html += `<p class="text-danger font-medium mb-2">Could not assign (${failed.length}):</p><ul class="text-start text-sm list-disc ps-4 mb-3">${failedList}</ul>`;
  }
  if (succeeded.length > 0) {
    html += `<p class="text-success font-medium mb-2">Assigned successfully (${succeeded.length}):</p><ul class="text-start text-sm list-disc ps-4">${succeededList}</ul>`;
  }

  const singleFailMsg = failed.length === 1 ? failed[0].error : null;

  await Swal.fire({
    title: allSucceeded
      ? "Membership assigned"
      : allFailed
        ? singleFailMsg || "Assignment failed"
        : "Some assignments failed",
    html: allSucceeded
      ? `<p>${succeeded.length} user(s) now have <strong>${escapeHtmlForDialog(planName)}</strong>.</p>`
      : html,
    icon: allSucceeded ? "success" : allFailed ? "error" : "warning",
    confirmButtonColor: "#ed662e",
    width: failed.length > 3 ? "32rem" : undefined,
  });
}
