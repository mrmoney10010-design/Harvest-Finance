import { validate } from 'class-validator';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';

describe('DepositDto and WithdrawDto validation', () => {
  it('DepositDto: accepts valid numeric amount and rejects string amount', async () => {
    const good = new DepositDto();
    good.userId = '550e8400-e29b-41d4-a716-446655440000';
    good.amount = 100;
    good.idempotencyKey = 'idemp-1';

    const errorsGood = await validate(good);
    if (errorsGood.length > 0) console.error('DepositDto good errors:', errorsGood);
    expect(errorsGood.length).toBe(0);

    const bad = new DepositDto();
    bad.userId = '550e8400-e29b-41d4-a716-446655440000';
    // @ts-ignore intentionally set string to exercise validator
    bad.amount = '100';

    const errorsBad = await validate(bad as any);
    expect(errorsBad.length).toBeGreaterThan(0);
  });

  it('DepositDto: rejects zero and negative amounts and high values', async () => {
    const zero = new DepositDto();
    zero.userId = '550e8400-e29b-41d4-a716-446655440000';
    zero.amount = 0;
    const ez = await validate(zero);
    expect(ez.length).toBeGreaterThan(0);

    const neg = new DepositDto();
    neg.userId = '550e8400-e29b-41d4-a716-446655440000';
    neg.amount = -10;
    const en = await validate(neg);
    expect(en.length).toBeGreaterThan(0);

    const high = new DepositDto();
    high.userId = '550e8400-e29b-41d4-a716-446655440000';
    high.amount = 1_000_001;
    const eh = await validate(high);
    expect(eh.length).toBeGreaterThan(0);
  });

  it('WithdrawDto: rejects zero/negative and string inputs', async () => {
    const good = new WithdrawDto();
    good.userId = '550e8400-e29b-41d4-a716-446655440000';
    good.amount = 10;
    const eg = await validate(good as any);
    expect(eg.length).toBe(0);

    const zero = new WithdrawDto();
    zero.userId = '550e8400-e29b-41d4-a716-446655440000';
    zero.amount = 0;
    const ez = await validate(zero as any);
    expect(ez.length).toBeGreaterThan(0);

    const bad = new WithdrawDto();
    // @ts-ignore
    bad.amount = '50';
    bad.userId = '550e8400-e29b-41d4-a716-446655440000';
    const eb = await validate(bad as any);
    expect(eb.length).toBeGreaterThan(0);
  });
});
