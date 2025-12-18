import { Text, Section, Cell, List, Input, Spinner } from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page.tsx';
import { reatomComponent } from '@reatom/react';
import { wrap } from '@reatom/core';
import ReactCountryFlag from 'react-country-flag';
import {
  allCurrenciesAtom,
  allExchangeRatesErrorAtom,
  selectedDateAtom,
  onChangeDateAction,
  primaryCurrencyAtom,
  amountAtom,
  yesterdayDate,
  isLoadingAtom,
} from './model';
import { formatMoney } from '../../helpers/money';
import { ErrorPlaceholder } from '@/components/ErrorPlaceholder';
import { CurrencyRateCell } from '@/components/CurrencyRateCell';
import { currencyCountryCodes } from '../exchange/country-codes';

import '../exchange/ExchangePage.css';

export const HistoryPage = reatomComponent(() => {
  const selectedDate = selectedDateAtom();
  const exchangeRatesError = allExchangeRatesErrorAtom();
  const allCurrencies = allCurrenciesAtom();
  const primaryCurrency = primaryCurrencyAtom();
  const amount = amountAtom();
  const isLoading = isLoadingAtom();

  return (
    <Page back>
      <List>
        <Cell
          before={
            <ReactCountryFlag
              countryCode={currencyCountryCodes[primaryCurrency]}
              style={{
                fontSize: '2em',
                lineHeight: '2em',
              }}
            />
          }
          subtitle="Base currency"
        >
          {`${formatMoney(amount, primaryCurrency)} ${primaryCurrency}`}
        </Cell>

        <Section header="Date">
          <Input
            className="input"
            type="date"
            value={selectedDate}
            max={yesterdayDate}
            onChange={(e) => {
              wrap(onChangeDateAction)(e);
              (e.target as HTMLInputElement).blur();
            }}
          />
        </Section>

        {exchangeRatesError && <ErrorPlaceholder />}

        {!exchangeRatesError && (
          <Section
            header={`Historical rates for ${formatMoney(amount, primaryCurrency)} ${primaryCurrency}`}
          >
            {isLoading > 0 && (
              <div className="spinnerContainer">
                <Spinner size="m" />
              </div>
            )}

            {!isLoading && allCurrencies.length === 0 && (
              <Cell>
                <Text>No selected exchange rates.</Text>
              </Cell>
            )}

            {allCurrencies.map((rate) => (
              <CurrencyRateCell
                key={rate.currency}
                rate={rate}
                primaryCurrency={primaryCurrency}
                amount={amount}
                className="noHover"
              />
            ))}
          </Section>
        )}
      </List>
    </Page>
  );
}, 'HistoryPage');
