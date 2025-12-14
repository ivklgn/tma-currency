import { type ChangeEvent, type ReactNode, cloneElement, isValidElement } from 'react';
import { List, Input, Section, Cell, Modal } from '@telegram-apps/telegram-ui';
import ReactCountryFlag from 'react-country-flag';
import { currencies } from '../pages/exchange/currencies';
import { action, atom } from '@reatom/framework';
import { useAction, useAtom } from '@reatom/npm-react';
import { currencyCountryCodes } from '../pages/exchange/country-codes';
import { ModalHeader } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader';

const searchCurrenciesAtom = atom('', 'searchCurrenciesAtom');
const filteredCurrenciesAtom = atom(
  (ctx) =>
    Object.entries(currencies).filter(
      ([code, name]) =>
        code.toLocaleLowerCase().includes(ctx.spy(searchCurrenciesAtom).toLocaleLowerCase()) ||
        name.toLocaleLowerCase().includes(ctx.spy(searchCurrenciesAtom).toLocaleLowerCase())
    ),
  'filteredCurrenciesAtom'
);
const onChangeSearch = action((ctx, event: ChangeEvent<HTMLInputElement>) => {
  searchCurrenciesAtom(ctx, event.currentTarget.value);
}, 'onChangeSearch');

interface CurrencySelectProps {
  opener: ReactNode;
  onSelect?: (currencyCode: string) => void;
}

export function CurrencySelectModal({ opener, onSelect }: CurrencySelectProps) {
  const [isOpen, setOpen] = useAtom(false);
  const [search] = useAtom(searchCurrenciesAtom);
  const [filteredCurrencies] = useAtom(filteredCurrenciesAtom);
  const handleChangeSearch = useAction(onChangeSearch);

  const _opener = isValidElement<{ onClick?: () => void }>(opener)
    ? cloneElement(opener, { onClick: () => setOpen(true) })
    : opener;

  return (
    <Modal
      open={isOpen}
      onOpenChange={(value) => {
        if (!value) {
          setOpen(false);
        }
      }}
      header={<ModalHeader>Choose currency</ModalHeader>}
      trigger={_opener}
      style={{ height: 'calc(100vh - 300px)' }}
    >
      <List>
        <Input
          header="Currencies"
          placeholder="Search currency"
          onChange={handleChangeSearch}
          value={search}
        />
        {filteredCurrencies.map(([code, name]) => (
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
              onClick={() => {
                onSelect?.(code);
                setOpen(false);
              }}
            >
              {code}
            </Cell>
          </Section>
        ))}
      </List>
    </Modal>
  );
}
