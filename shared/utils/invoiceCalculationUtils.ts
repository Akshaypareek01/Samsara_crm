/**
 * Client-side trainer fee line calculations (mirrors backend invoiceCalculationUtils).
 */

export interface TaxRowInput {
    name: string;
    rate: number;
    type: 'percentage' | 'fixed';
    amount?: number;
}

export interface DeductionRowInput {
    name: string;
    amount: number;
}

export interface TrainerFeeLineInput {
    trainer: string;
    sessionIndex?: number;
    trainerName?: string;
    startTime?: string;
    duration?: number;
    typeOfTraining?: string[];
    baseFee: number;
    gstRate: number;
    otherTaxes: TaxRowInput[];
    deductions: DeductionRowInput[];
}

export interface CalculatedTrainerFeeLine extends TrainerFeeLineInput {
    gstAmount: number;
    totalOtherTaxes: number;
    totalDeductions: number;
    grossAmount: number;
    netPayable: number;
}

/**
 * Round currency to 2 decimal places.
 */
export function roundMoney(value: number): number {
    return Math.round((Number(value) || 0) * 100) / 100;
}

/**
 * Compute tax amount from base and tax row.
 */
export function computeTaxAmount(baseAmount: number, tax: TaxRowInput): number {
    const rate = Number(tax.rate) || 0;
    if (tax.type === 'fixed') {
        return roundMoney(tax.amount || 0);
    }
    if (rate <= 0) return 0;
    return roundMoney((baseAmount * rate) / 100);
}

/**
 * Build calculated trainer fee line.
 */
export function buildTrainerFeeLine(input: TrainerFeeLineInput): CalculatedTrainerFeeLine {
    const baseFee = roundMoney(input.baseFee);
    const gstRate = Number(input.gstRate) || 0;
    const gstAmount = roundMoney((baseFee * gstRate) / 100);

    const otherTaxes = (input.otherTaxes || []).map((tax) => ({
        ...tax,
        amount: computeTaxAmount(baseFee, tax),
    }));

    const deductions = (input.deductions || []).map((d) => ({
        name: d.name,
        amount: roundMoney(d.amount),
    }));

    const totalOtherTaxes = roundMoney(otherTaxes.reduce((sum, t) => sum + (t.amount || 0), 0));
    const totalDeductions = roundMoney(deductions.reduce((sum, d) => sum + d.amount, 0));
    const grossAmount = roundMoney(baseFee + gstAmount + totalOtherTaxes);
    const netPayable = roundMoney(Math.max(0, grossAmount - totalDeductions));

    return {
        ...input,
        baseFee,
        gstRate,
        gstAmount,
        otherTaxes,
        totalOtherTaxes,
        deductions,
        totalDeductions,
        grossAmount,
        netPayable,
    };
}

/**
 * Aggregate totals across trainer lines.
 */
export function aggregateTrainerFeeTotals(lines: CalculatedTrainerFeeLine[]) {
    const totals = {
        baseFee: 0,
        gstAmount: 0,
        totalOtherTaxes: 0,
        totalDeductions: 0,
        grossAmount: 0,
        netPayable: 0,
    };

    for (const line of lines) {
        totals.baseFee += line.baseFee;
        totals.gstAmount += line.gstAmount;
        totals.totalOtherTaxes += line.totalOtherTaxes;
        totals.totalDeductions += line.totalDeductions;
        totals.grossAmount += line.grossAmount;
        totals.netPayable += line.netPayable;
    }

    Object.keys(totals).forEach((k) => {
        totals[k as keyof typeof totals] = roundMoney(totals[k as keyof typeof totals]);
    });

    return totals;
}

/**
 * Format INR for display.
 */
export function formatInr(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(Number(amount) || 0);
}
