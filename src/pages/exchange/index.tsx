import {
  Text,
  Section,
  Cell,
  List,
  ButtonCell,
  Input,
  Tappable,
  Spinner,
  Placeholder,
} from "@telegram-apps/telegram-ui";
import { type FC } from "react";
import { Icon28AddCircle } from "@telegram-apps/telegram-ui/dist/icons/28/add_circle";
import { Icon20ChevronDown } from "@telegram-apps/telegram-ui/dist/icons/20/chevron_down";
import ReactCountryFlag from "react-country-flag";
import { Link } from "@/components/Link/Link.tsx";
import { Page } from "@/components/Page.tsx";
import { useAction, useAtom } from "@reatom/npm-react";
import {
  amountAtom,
  exchangeRatesResources,
  onChangeAmountAction,
  onChangePrimaryCurrencyAction,
  onChangeTargetCurrencyAction,
  onDeleteTargetCurrencyAction,
  onResetAmountAction,
  primaryCurrencyAtom,
} from "./model";
import { currencyCountryCodes } from "./country-codes";
import { CurrencySelectModal } from "../../features/CurrencySelectModal";
import { Icon24Close } from "../../components/patched-icons";
import { formatMoney } from "../../helpers/money";

import "./ExchangePage.css";

export const ExchangePage: FC = () => {
  const [isAddNewCurrencyFormVisible, setIsAddNewCurrencyFormVisible] = useAtom(false);
  const [amount] = useAtom(amountAtom);
  const [primaryCurrency] = useAtom(primaryCurrencyAtom);
  const [exchangeRates] = useAtom(exchangeRatesResources.dataAtom);
  const [exchangeRatesError] = useAtom(exchangeRatesResources.errorAtom);
  const [isLoadingExchangeRates] = useAtom((ctx) => ctx.spy(exchangeRatesResources.pendingAtom) > 0);
  const handleChangeAmount = useAction(onChangeAmountAction);
  const handleDeleteTargetCurrency = useAction(onDeleteTargetCurrencyAction);
  const handleResetAmount = useAction(onResetAmountAction);
  const handleChangePrimaryCurrency = useAction(onChangePrimaryCurrencyAction);
  const handleChangeTargetCurrencyAction = useAction(onChangeTargetCurrencyAction);

  const handleAddTargetCurrency = (currency: string) => {
    handleChangeTargetCurrencyAction(currency);
    setIsAddNewCurrencyFormVisible(false);
  };

  return (
    <Page>
      <List>
        <Section header="Amount">
          <Input
            className="input"
            placeholder="Amount"
            defaultValue={1}
            type="number"
            min={1}
            onChange={handleChangeAmount}
            value={amount}
            after={
              <Tappable
                Component="div"
                style={{
                  display: "flex",
                }}
              >
                <Icon24Close onClick={handleResetAmount} />
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
                      display: "flex",
                    }}
                  >
                    <Icon20ChevronDown className="chevronDown" />
                  </Tappable>
                }
              >
                <Text>{primaryCurrency || "Select primary currency"}</Text>
              </Cell>
            }
            onSelect={handleChangePrimaryCurrency}
          />
        </Section>

        {exchangeRatesError && (
          <Placeholder header="Oops, something went wrong" description="Reload app or try later">
            <img
              alt="Telegram sticker"
              src="https://xelene.me/telegram.gif"
              style={{ display: "block", width: "144px", height: "144px" }}
            />
          </Placeholder>
        )}

        {isLoadingExchangeRates && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Spinner size="m" />
          </div>
        )}

        {!isLoadingExchangeRates && !exchangeRatesError && (
          <Section header="Exchange rate">
            {!isAddNewCurrencyFormVisible && exchangeRates.length === 0 && (
              <Cell>
                <Text>No selected exchange rates.</Text>
              </Cell>
            )}
            {!isAddNewCurrencyFormVisible &&
              exchangeRates.map((rate) => (
                <Link to={`/exchange-rate?currency=${rate.currency}`} key={rate.currency}>
                  <Cell
                    before={
                      <ReactCountryFlag
                        countryCode={currencyCountryCodes[rate.currency]}
                        style={{
                          fontSize: "2em",
                          lineHeight: "2em",
                        }}
                      />
                    }
                    after={
                      <Tappable
                        Component="div"
                        style={{
                          display: "flex",
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteTargetCurrency(rate.currency);
                        }}
                      >
                        <Icon24Close />
                      </Tappable>
                    }
                    subtitle={`${formatMoney(amount || 1, primaryCurrency)} ${primaryCurrency} = ${formatMoney(
                      rate.rate * (amount || 1),
                      rate.currency
                    )} ${rate.currency}`}
                  >
                    {`${formatMoney(rate.rate, rate.currency)} ${rate.currency}`}
                  </Cell>
                </Link>
              ))}
            <CurrencySelectModal
              opener={<ButtonCell before={<Icon28AddCircle />}>Add currency</ButtonCell>}
              onSelect={handleAddTargetCurrency}
            />
          </Section>
        )}
      </List>
    </Page>
  );
};
