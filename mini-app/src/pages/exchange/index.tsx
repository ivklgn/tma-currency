import {
  Text,
  Section,
  Cell,
  List,
  ButtonCell,
  Input,
  Tappable,
  Placeholder,
} from '@telegram-apps/telegram-ui';
import { Icon28AddCircle } from '@telegram-apps/telegram-ui/dist/icons/28/add_circle';
import { Icon20ChevronDown } from '@telegram-apps/telegram-ui/dist/icons/20/chevron_down';
import ReactCountryFlag from 'react-country-flag';
import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';
import { reatomComponent } from '@reatom/react';
import { wrap } from '@reatom/core';
import {
  amountAtom,
  amountInputAtom,
  targetCurrenciesAtom,
  onChangeAmountAction,
  onChangePrimaryCurrencyAction,
  onChangeTargetCurrencyAction,
  onDeleteTargetCurrencyAction,
  onResetAmountAction,
  primaryCurrencyAtom,
  exchangeRatesErrorAtom,
} from './model';
import { currencyCountryCodes } from './country-codes';
import { CurrencySelectModal } from '../../features/CurrencySelectModal';
import { Icon24Close } from '../../components/patched-icons';
import { formatMoney } from '../../helpers/money';

import './ExchangePage.css';

export const ExchangePage = reatomComponent(() => {
  const amount = amountAtom();
  const amountInput = amountInputAtom();
  const primaryCurrency = primaryCurrencyAtom();
  const exchangeRatesError = exchangeRatesErrorAtom();
  const targetCurrencies = targetCurrenciesAtom();

  return (
    <Page>
      <List>
        <Section header="Amount">
          <Input
            className="input"
            placeholder="Amount"
            type="number"
            min={1}
            onChange={wrap(onChangeAmountAction)}
            value={amountInput}
            after={
              <Tappable
                Component="div"
                style={{
                  display: 'flex',
                }}
                onClick={wrap(onResetAmountAction)}
              >
                <Icon24Close />
              </Tappable>
            }
          />
        </Section>
        <Section header="Primary currency">
          <CurrencySelectModal
            opener={
              <Cell
                className="select"
                after={
                  <Tappable
                    Component="div"
                    style={{
                      display: 'flex',
                    }}
                  >
                    <Icon20ChevronDown className="chevronDown" />
                  </Tappable>
                }
              >
                <Text>{primaryCurrency || 'Select primary currency'}</Text>
              </Cell>
            }
            onSelect={onChangePrimaryCurrencyAction}
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
          <Section header="Exchange rate">
            <CurrencySelectModal
              opener={<ButtonCell before={<Icon28AddCircle />}>Add currency</ButtonCell>}
              onSelect={onChangeTargetCurrencyAction}
            />

            {targetCurrencies.length === 0 && (
              <Cell>
                <Text>No selected exchange rates.</Text>
              </Cell>
            )}

            {targetCurrencies.map((rate) => (
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
                  after={
                    <Tappable
                      Component="div"
                      style={{
                        display: 'flex',
                      }}
                      onClick={wrap((e) => {
                        e.preventDefault();
                        onDeleteTargetCurrencyAction(rate.currency);
                      })}
                    >
                      <Icon24Close />
                    </Tappable>
                  }
                  subtitle={`1 ${primaryCurrency} = ${formatMoney(rate.rate, rate.currency)} ${rate.currency}`}
                >
                  {formatMoney(rate.rate * (amount || 1), rate.currency)} {rate.currency}
                </Cell>
              </Link>
            ))}
          </Section>
        )}
      </List>
    </Page>
  );
}, 'ExchangePage');
