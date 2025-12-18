import { type ReactNode, cloneElement, isValidElement, useState } from 'react';
import { List, Section, Cell, Modal } from '@telegram-apps/telegram-ui';
import ReactCountryFlag from 'react-country-flag';
import { currencies } from '../pages/exchange/currencies';
import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { currencyCountryCodes } from '../pages/exchange/country-codes';

const currencyEntries = Object.entries(currencies);

interface CurrencySelectProps {
  opener: ReactNode;
  onSelect?: (currencyCode: string) => void;
}

export const CurrencySelectModal = reatomComponent<CurrencySelectProps>(({ opener, onSelect }) => {
  const [isOpen, setOpen] = useState(false);

  const _opener = isValidElement<{ onClick?: () => void }>(opener)
    ? cloneElement(opener, { onClick: () => setOpen(true) })
    : opener;

  return (
    <>
      {_opener}
      <Modal open={isOpen} onOpenChange={wrap((value) => !value && setOpen(false))}>
        <Modal.Header>Choose currency</Modal.Header>
        <List
          style={{
            maxHeight: 'calc(100vh - 400px)',
            overflow: 'auto',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {currencyEntries.map(([code, name]) => (
            <Section key={code}>
              <Cell
                before={
                  <ReactCountryFlag
                    countryCode={currencyCountryCodes[code]}
                    style={{
                      fontSize: '2em',
                      lineHeight: '2em',
                    }}
                  />
                }
                subtitle={name}
                onClick={wrap(() => {
                  onSelect?.(code);
                  setOpen(false);
                })}
              >
                {code}
              </Cell>
            </Section>
          ))}
        </List>
      </Modal>
    </>
  );
}, 'CurrencySelectModal');
