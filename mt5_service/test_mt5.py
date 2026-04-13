import MetaTrader5 as mt5
import datetime
import pandas as pd

# connect to running MT5 terminal
if not mt5.initialize():
    print("MT5 initialize failed:", mt5.last_error())
    quit()

print("Connected to MT5")

# get account info
# account = mt5.account_info()

# if account:
#     print(f"Login: {account.login}")
#     print(f"Balance: {account.balance} {account.currency}")
#     print(f"Equity: {account.equity} {account.currency}")
#     print(f"Leverage: {account.leverage}")
#     print(f"Margin: {account.margin} {account.currency}")
#     print(f"Margin Free: {account.margin_free} {account.currency}")
#     print(f"Margin Level: {account.margin_level}")
#     print(f"Name: {account.name}")
#     print(f"Server: {account.server}")
#     print(f"Company: {account.company}")


history = mt5.history_deals_get(from_date=datetime(2022, 1, 1), to_date=datetime.now())

df = pd.DataFrame(history)


print(df.head(50))

mt5.shutdown()
