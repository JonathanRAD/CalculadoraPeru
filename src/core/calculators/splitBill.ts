import { roundTo } from '../math/formatters';

export interface SplitBillInput {
  totalBill: number; // Monto total de la cuenta (S/)
  tipPercentage: number; // Porcentaje de propina (ej: 0%, 5%, 10%, 15%)
  numberOfPeople: number; // Número de personas para dividir
}

export interface SplitBillResult {
  totalBill: number;
  tipAmount: number; // Monto total de propina en Soles
  totalWithTip: number; // Total general a pagar en el restaurante
  amountPerPerson: number; // Cuánto debe pagar/yapear cada persona
  tipPerPerson: number; // Propina que aporta cada persona
}

/**
 * Calcula la división de cuenta y propina en restaurantes de Perú.
 */
export function calculateSplitBill(input: SplitBillInput): SplitBillResult {
  const bill = Math.max(0, input.totalBill || 0);
  const tipPct = Math.max(0, input.tipPercentage || 0);
  const people = Math.max(1, input.numberOfPeople || 1);

  const tipAmount = (bill * tipPct) / 100;
  const totalWithTip = bill + tipAmount;
  const amountPerPerson = totalWithTip / people;
  const tipPerPerson = tipAmount / people;

  return {
    totalBill: roundTo(bill, 2),
    tipAmount: roundTo(tipAmount, 2),
    totalWithTip: roundTo(totalWithTip, 2),
    amountPerPerson: roundTo(amountPerPerson, 2),
    tipPerPerson: roundTo(tipPerPerson, 2),
  };
}
