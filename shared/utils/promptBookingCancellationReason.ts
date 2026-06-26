import Swal from 'sweetalert2';

/**
 * Show a SweetAlert form to collect a required booking cancellation reason.
 *
 * @returns Trimmed reason when confirmed, or null when dismissed.
 */
export async function promptBookingCancellationReason(): Promise<string | null> {
  const result = await Swal.fire({
    title: 'Cancel Booking?',
    text: 'Please provide a reason for cancellation.',
    input: 'textarea',
    inputLabel: 'Cancellation reason',
    inputPlaceholder: 'Why are you cancelling this booking?',
    inputAttributes: {
      'aria-label': 'Cancellation reason',
    },
    inputValidator: (value) => {
      if (!value?.trim()) {
        return 'Cancellation reason is required';
      }
      return undefined;
    },
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, cancel it',
  });

  if (result.isConfirmed && result.value) {
    return String(result.value).trim();
  }

  return null;
}
