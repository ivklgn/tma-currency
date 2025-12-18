import { Text, Section, Cell, List, ButtonCell, Input, Tappable } from '@telegram-apps/telegram-ui';
import { Icon28AddCircle } from '@telegram-apps/telegram-ui/dist/icons/28/add_circle';
import { Icon20ChevronDown } from '@telegram-apps/telegram-ui/dist/icons/20/chevron_down';
import { Page } from '@/components/Page.tsx';
import { Link } from '@/components/Link/Link.tsx';
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
import { CurrencySelectModal } from '../../features/CurrencySelectModal';
import { Icon24Close } from '../../components/patched-icons';
import { ErrorPlaceholder } from '@/components/ErrorPlaceholder';
import { CurrencyRateCell } from '@/components/CurrencyRateCell';

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

        {exchangeRatesError && <ErrorPlaceholder />}

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
              <Link to="/all" key={rate.currency}>
                <CurrencyRateCell
                  rate={rate}
                  primaryCurrency={primaryCurrency}
                  amount={amount || 1}
                  after={
                    <Tappable
                      Component="div"
                      style={{
                        display: 'flex',
                      }}
                      onClick={wrap(() => onDeleteTargetCurrencyAction(rate.currency))}
                    >
                      <Icon24Close />
                    </Tappable>
                  }
                />
              </Link>
            ))}
          </Section>
        )}
      </List>
    </Page>
  );
}, 'ExchangePage');
