import { Text, Section, Cell, List, Input } from '@telegram-apps/telegram-ui';
import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';
import { reatomComponent } from '@reatom/react';
import { wrap } from '@reatom/core';
import {
  allCurrenciesAtom,
  allExchangeRatesErrorAtom,
  selectedDateAtom,
  onChangeDateAction,
  primaryCurrencyAtom,
  amountAtom,
  yesterdayDate,
} from './model';
import { formatMoney } from '../../helpers/money';
import { ErrorPlaceholder } from '@/components/ErrorPlaceholder';
import { CurrencyRateCell } from '@/components/CurrencyRateCell';

import '../exchange/ExchangePage.css';

export const AllPage = reatomComponent(() => {
  const selectedDate = selectedDateAtom();
  const exchangeRatesError = allExchangeRatesErrorAtom();
  const allCurrencies = allCurrenciesAtom();
  const primaryCurrency = primaryCurrencyAtom();
  const amount = amountAtom();

  return (
    <Page>
      <List>
        <Section header="Date">
          <Input
            className="input"
            type="date"
            value={selectedDate}
            max={yesterdayDate}
            onChange={wrap(onChangeDateAction)}
          />
        </Section>

        {exchangeRatesError && <ErrorPlaceholder />}

        {!exchangeRatesError && (
          <Section
            header={`Historical rates for ${formatMoney(amount, primaryCurrency)} ${primaryCurrency}`}
          >
            {allCurrencies.length === 0 && (
              <Cell>
                <Text>Loading exchange rates...</Text>
              </Cell>
            )}

            {allCurrencies.map((rate) => (
              <Link to={`/exchange-rate?currency=${rate.currency}`} key={rate.currency}>
                <CurrencyRateCell
                  rate={rate}
                  primaryCurrency={primaryCurrency}
                  amount={amount}
                />
              </Link>
            ))}
          </Section>
        )}
      </List>
    </Page>
  );
}, 'AllPage');
