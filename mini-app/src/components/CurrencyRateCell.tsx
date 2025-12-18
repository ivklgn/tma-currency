import { Cell } from '@telegram-apps/telegram-ui';
import ReactCountryFlag from 'react-country-flag';
import { currencyCountryCodes } from '@/pages/exchange/country-codes';
import { formatMoney } from '@/helpers/money';
import { ICurrencyRate } from '@/types/currency';

interface CurrencyRateCellProps {
  rate: ICurrencyRate;
  primaryCurrency: string;
  amount: number;
  after?: React.ReactNode;
  className?: string;
}

export const CurrencyRateCell = ({
  rate,
  primaryCurrency,
  amount,
  after,
  className,
}: CurrencyRateCellProps) => (
  <Cell
    className={className}
    before={
      <ReactCountryFlag
        countryCode={currencyCountryCodes[rate.currency]}
        style={{
          fontSize: '2em',
          lineHeight: '2em',
        }}
      />
    }
    after={after}
    subtitle={`1 ${primaryCurrency} = ${formatMoney(rate.rate, rate.currency)} ${rate.currency}`}
  >
    {formatMoney(rate.rate * amount, rate.currency)} {rate.currency}
  </Cell>
);
