import { Text, Section, Cell, List, Placeholder, Input } from '@telegram-apps/telegram-ui';
import ReactCountryFlag from 'react-country-flag';
import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';
import { reatomComponent } from '@reatom/react';
import { wrap } from '@reatom/core';
import {
  allCurrenciesAtom,
  allExchangeRatesErrorAtom,
  selectedDateAtom,
  onChangeDateAction,
} from './model';
import { currencyCountryCodes } from '../exchange/country-codes';
import { formatMoney } from '../../helpers/money';

import '../exchange/ExchangePage.css';

export const AllPage = reatomComponent(() => {
  const selectedDate = selectedDateAtom();
  const exchangeRatesError = allExchangeRatesErrorAtom();
  const allCurrencies = allCurrenciesAtom();

  return (
    <Page>
      <List>
        <Section header="Date">
          <Input
            className="input"
            type="date"
            value={selectedDate}
            onChange={wrap(onChangeDateAction)}
          />
        </Section>

        {exchangeRatesError && (
          <Placeholder header="Oops, something went wrong" description="Reload app or try later">
            <img
              alt="Telegram sticker"
              src="https://xelene.me/telegram.gif"
              style={{ display: 'block', width: '144px', height: '144px' }}
            />
          </Placeholder>
        )}

        {!exchangeRatesError && (
          <Section header="All exchange rates">
            {allCurrencies.length === 0 && (
              <Cell>
                <Text>Loading exchange rates...</Text>
              </Cell>
            )}

            {allCurrencies.map((rate) => (
              <Link to={`/exchange-rate?currency=${rate.currency}`} key={rate.currency}>
                <Cell
                  before={
                    <ReactCountryFlag
                      countryCode={currencyCountryCodes[rate.currency]}
                      style={{
                        fontSize: '2em',
                        lineHeight: '2em',
                      }}
                    />
                  }
                  subtitle={`1 USD = ${formatMoney(rate.rate, rate.currency)} ${rate.currency}`}
                >
                  {formatMoney(rate.rate, rate.currency)} {rate.currency}
                </Cell>
              </Link>
            ))}
          </Section>
        )}
      </List>
    </Page>
  );
}, 'AllPage');
