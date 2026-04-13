# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from typing import List, Optional
# import MetaTrader5 as mt5
# import asyncio
# from datetime import datetime, timedelta
# app = FastAPI(title="MT5 Python API")

# # --- Pydantic Models for Credentials ---
# class MT5Credentials(BaseModel):
#     login: int
#     password: str
#     server: str

# class SymbolRequest(MT5Credentials):
#     symbols: List[str]

# # --- Helper logic ---
# def connect_mt5(creds: MT5Credentials):
#     """
#     Initializes MT5. Since MT5 natively connects to one account at a time per terminal,
#     we explicitly pass the login credentials. If another user calls this, the terminal
#     logs into the new account.
#     For high concurrency, one terminal per user is needed (or separate processes),
#     but this suffices for MVP dynamic polling.
#     """
#     if not mt5.initialize(login=creds.login, password=creds.password, server=creds.server):
#         raise HTTPException(status_code=500, detail=f"Failed to initialize MT5: {mt5.last_error()}")

# # --- Endpoints ---
# @app.post("/account")
# def get_account(creds: MT5Credentials):
#     connect_mt5(creds)
#     account_info = mt5.account_info()
#     if account_info is None:
#         raise HTTPException(status_code=404, detail=f"Failed to get account info: {mt5.last_error()}")

#     return {
#         "login": account_info.login,
#         "balance": account_info.balance,
#         "equity": account_info.equity,
#         "profit": account_info.profit,
#         "margin": account_info.margin,
#         "margin_free": account_info.margin_free,
#         "margin_level": account_info.margin_level,
#         "name": account_info.name,
#         "server": account_info.server,
#         "currency": account_info.currency,
#         "company": account_info.company
#     }

# @app.post("/positions")
# def get_positions(creds: MT5Credentials):
#     connect_mt5(creds)
#     positions = mt5.positions_get()

#     if positions is None:
#         return []
#     elif len(positions) == 0:
#         return []

#     formatted_positions = []
#     for pos in positions:
#         formatted_positions.append({
#             "ticket": pos.ticket,
#             "symbol": pos.symbol,
#             "type": "BUY" if pos.type == mt5.POSITION_TYPE_BUY else "SELL",
#             "volume": pos.volume,
#             "price_open": pos.price_open,
#             "price_current": pos.price_current,
#             "sl": pos.sl,
#             "tp": pos.tp,
#             "profit": pos.profit,
#             "time": pos.time
#         })
#     return formatted_positions

# @app.post("/market")
# def get_market(req: SymbolRequest):
#     connect_mt5(req)

#     results = []
#     for symbol in req.symbols:
#         tick = mt5.symbol_info_tick(symbol)
#         if tick:
#             results.append({
#                 "symbol": symbol,
#                 "bid": tick.bid,
#                 "ask": tick.ask,
#                 "time": tick.time
#             })
#     return results

# @app.post("/history")
# def get_history(creds: MT5Credentials):
#     connect_mt5(creds)

#     # Get deals from the last 30 days
#     date_to = datetime.now()
#     date_from = date_to - timedelta(days=30)
#     deals = mt5.history_deals_get(date_from, date_to)

#     if deals is None:
#         deals = []

#     trades_closed = 0
#     winning_trades = 0
#     total_profit = 0
#     equity_curve = []

#     for deal in deals:
#         # entry == 1 means DEAL_ENTRY_OUT (trade closed)
#         if deal.entry == 1:
#             trades_closed += 1
#             if deal.profit > 0:
#                 winning_trades += 1
#             total_profit += deal.profit
#             equity_curve.append({
#                 "time": datetime.fromtimestamp(deal.time).isoformat(),
#                 "profit": deal.profit
#             })

#     win_rate = (winning_trades / trades_closed * 100) if trades_closed > 0 else 0

#     return {
#         "win_rate": round(win_rate, 2),
#         "total_profit": total_profit,
#         "trades_closed": trades_closed,
#         "deals_history": equity_curve
#     }

# if __name__ == "__main__":
#     import uvicorn
#     # run locally on port 8000
#     uvicorn.run(app, host="0.0.0.0", port=8000)


from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import MetaTrader5 as mt5
from datetime import datetime, timedelta

app = FastAPI(title="MT5 Python API")


# -----------------------------
# Pydantic Models
# -----------------------------
class MT5Credentials(BaseModel):
    login: int
    password: str
    server: str


class SymbolRequest(MT5Credentials):
    symbols: List[str]


class CloseTradeRequest(BaseModel):
    ticket: int


# -----------------------------
# MT5 Connection Helper
# -----------------------------
def connect_mt5(creds: MT5Credentials):
    # Try to connect to the already running terminal sessions
    if not mt5.initialize():
        error_msg = f"MT5 initialization failed: {mt5.last_error()}"
        print(f"\033[91mERROR: {error_msg}\033[0m")
        raise HTTPException(
            status_code=500, detail=error_msg
        )
    
    # Verify we are actually logged into some account in the terminal
    account_info = mt5.account_info()
    if account_info is None:
        error_msg = "MT5 Terminal is not logged into any account. Please log in manually in the MT5 application."
        print(f"\033[93mWARNING: {error_msg}\033[0m")
        raise HTTPException(
            status_code=401, detail=error_msg
        )
    
    print(f"\033[92mConnected using terminal session: Account {account_info.login}\033[0m")


# -----------------------------
# Account Info
# -----------------------------
@app.post("/account")
def get_account(creds: MT5Credentials):

    connect_mt5(creds)

    account = mt5.account_info()

    if account is None:
        raise HTTPException(
            status_code=404, detail=f"Account info error: {mt5.last_error()}"
        )

    return {
        "login": account.login,
        "balance": account.balance,
        "equity": account.equity,
        "profit": account.profit,
        "margin": account.margin,
        "margin_free": account.margin_free,
        "margin_level": account.margin_level,
        "name": account.name,
        "server": account.server,
        "currency": account.currency,
        "company": account.company,
    }


# -----------------------------
# Open Positions
# -----------------------------
@app.post("/positions")
def get_positions(creds: MT5Credentials):

    connect_mt5(creds)

    positions = mt5.positions_get()

    if not positions:
        return []

    return [
        {
            "ticket": pos.ticket,
            "symbol": pos.symbol,
            "type": "BUY" if pos.type == mt5.POSITION_TYPE_BUY else "SELL",
            "volume": pos.volume,
            "price_open": pos.price_open,
            "price_current": pos.price_current,
            "sl": pos.sl,
            "tp": pos.tp,
            "profit": pos.profit,
            "time": pos.time,
        }
        for pos in positions
    ]


# -----------------------------
# Market Prices
# -----------------------------
@app.post("/market")
def get_market(req: SymbolRequest):

    connect_mt5(req)

    results = []

    for symbol in req.symbols:
        tick = mt5.symbol_info_tick(symbol)

        if tick:
            results.append(
                {"symbol": symbol, "bid": tick.bid, "ask": tick.ask, "time": tick.time}
            )

    return results


# -----------------------------
# Trade History (Last 30 Days)
# -----------------------------
@app.post("/history")
def get_history(creds: MT5Credentials):

    connect_mt5(creds)

    date_to = datetime.now()
    date_from = date_to - timedelta(days=30)

    deals = mt5.history_deals_get(date_from, date_to)

    if not deals:
        deals = []

    trades_closed = 0
    winning_trades = 0
    total_profit = 0
    equity_curve = []

    for deal in deals:

        if deal.entry == 1:
            trades_closed += 1

            if deal.profit > 0:
                winning_trades += 1

            total_profit += deal.profit

            equity_curve.append(
                {
                    "ticket": deal.ticket,
                    "symbol": deal.symbol,
                    "type": "BUY" if deal.type == mt5.DEAL_TYPE_BUY else "SELL",
                    "volume": deal.volume,
                    "price": deal.price,
                    "commission": deal.commission,
                    "swap": deal.swap,
                    "time": datetime.fromtimestamp(deal.time).isoformat(),
                    "profit": deal.profit,
                }
            )

    win_rate = (winning_trades / trades_closed * 100) if trades_closed else 0

    return {
        "win_rate": round(win_rate, 2),
        "total_profit": total_profit,
        "trades_closed": trades_closed,
        "deals_history": equity_curve,
    }


# -----------------------------
# Close Trades
# -----------------------------
def execute_close(ticket: int):
    """Helper to close a position by ticket"""
    positions = mt5.positions_get(ticket=ticket)
    if not positions or len(positions) == 0:
        return {"status": "error", "message": f"Position {ticket} not found"}

    pos = positions[0]
    symbol = pos.symbol
    tick = mt5.symbol_info_tick(symbol)
    if not tick:
        return {"status": "error", "message": f"Could not get market price for {symbol}"}

    # Prepare opposite order
    order_type = mt5.ORDER_TYPE_SELL if pos.type == mt5.POSITION_TYPE_BUY else mt5.ORDER_TYPE_BUY
    price = tick.bid if order_type == mt5.ORDER_TYPE_SELL else tick.ask

    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": pos.volume,
        "type": order_type,
        "position": ticket,
        "price": price,
        "deviation": 20,
        "magic": 0,
        "comment": "Dashboard Close",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }

    result = mt5.order_send(request)
    if result.retcode != mt5.TRADE_RETCODE_DONE:
        return {"status": "error", "message": f"MT5 Error: {result.comment} (code: {result.retcode})"}

    return {"status": "success", "ticket": ticket}


@app.post("/close_position")
def api_close_position(req: CloseTradeRequest):
    # Ensure terminal connected
    # We ignore creds now as we use passive connection, but the helper handles init
    if not mt5.initialize(): 
         raise HTTPException(status_code=500, detail="Terminal connection failed")
    
    return execute_close(req.ticket)


@app.post("/close_all")
def api_close_all():
    if not mt5.initialize(): 
         raise HTTPException(status_code=500, detail="Terminal connection failed")

    positions = mt5.positions_get()
    if not positions:
        return {"status": "success", "message": "No positions to close", "closed": 0}

    results = []
    for pos in positions:
        res = execute_close(pos.ticket)
        results.append(res)

    success_count = len([r for r in results if r["status"] == "success"])
    return {
        "status": "success", 
        "total": len(positions), 
        "closed": success_count,
        "details": results
    }


# -----------------------------
# Run Server
# -----------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)
