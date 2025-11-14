INSERT OR IGNORE INTO app_settings (key, value) VALUES ('family-name', 'Strategy Lab');
INSERT OR IGNORE INTO app_settings (key, value) VALUES ('take-profit-percent', '15');
INSERT OR IGNORE INTO app_settings (key, value) VALUES ('stop-loss-percent', '7');
INSERT OR IGNORE INTO app_settings (key, value) VALUES ('notification-cooldown', '120');
INSERT OR IGNORE INTO app_settings (key, value) VALUES ('theme', 'dark');
INSERT OR IGNORE INTO app_settings (key, value) VALUES ('font', 'monospace');

INSERT OR IGNORE INTO account_holders (username) VALUES ('John Doe');
INSERT OR IGNORE INTO account_holders (username) VALUES ('Jane Smith');
INSERT OR IGNORE INTO account_holders (username) VALUES ('Peter Jones');

INSERT OR IGNORE INTO advice_sources (name, type, url, description, person_email) VALUES ('Investment Guru', 'person', 'http://guru.com', 'A seasoned investor.', 'guru@example.com');
INSERT OR IGNORE INTO advice_sources (name, type, url, description, book_author, book_isbn) VALUES ('The Intelligent Investor', 'book', 'http://amazon.com/intelligent-investor', 'Classic investment book.', 'Benjamin Graham', '978-0060955541');
INSERT OR IGNORE INTO advice_sources (name, type, url, description, website_websites) VALUES ('Financial Times', 'website', 'http://ft.com', 'Global business news.', 'http://ft.com,http://markets.ft.com');

INSERT OR IGNORE INTO exchanges (name, url, description) VALUES ('NYSE', 'http://nyse.com', 'New York Stock Exchange');
INSERT OR IGNORE INTO exchanges (name, url, description) VALUES ('NASDAQ', 'http://nasdaq.com', 'NASDAQ Stock Market');

INSERT OR IGNORE INTO web_apps (name) VALUES ('TradingView');
INSERT OR IGNORE INTO web_apps (name) VALUES ('Thinkorswim');

INSERT OR IGNORE INTO watched_items (is_paper_trade, user_id, source_id, strategy_id, ticker, order_type, buy_price_high, buy_price_low, take_profit_high, take_profit_low, escape_price, status, notes, created_date) VALUES
(1, 1, 1, NULL, 'AAPL', 'Buy Limit', 150.00, 148.00, 165.00, 160.00, 145.00, 'WATCHING', 'Tech stock, good entry point.', '2023-10-26T10:00:00Z'),
(1, 1, 2, NULL, 'MSFT', 'Buy Limit', 300.00, 295.00, 330.00, 320.00, 290.00, 'WATCHING', 'Software giant, stable growth.', '2023-10-27T11:00:00Z'),
(1, 2, 1, NULL, 'GOOGL', 'Buy Limit', 130.00, 128.00, 145.00, 140.00, 125.00, 'WATCHING', 'AI potential, strong fundamentals.', '2023-10-28T12:00:00Z');

INSERT OR IGNORE INTO transactions (is_paper_trade, user_id, source_id, watched_item_id, transaction_date, ticker, transaction_type, quantity, price, quantity_remaining) VALUES
(1, 1, 1, 1, '2023-10-29T09:30:00Z', 'AAPL', 'BUY', 10, 149.50, 10),
(1, 1, 2, 2, '2023-10-30T10:15:00Z', 'MSFT', 'BUY', 5, 298.75, 5);
