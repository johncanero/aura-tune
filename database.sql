/**
* USERS
* Note: This table contains user data. Users should only be able to view and update their own data.
*/
CREATE TABLE USERS (
 -- UUID from auth.users
    ID UUID REFERENCES AUTH.USERS NOT NULL PRIMARY KEY,
    FULL_NAME TEXT,
    AVATAR_URL TEXT,
 -- The customer's billing address, stored in JSON format.
    BILLING_ADDRESS JSONB,
 -- Stores your customer's payment instruments.
    PAYMENT_METHOD JSONB
);

ALTER TABLE USERS ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Can view own user data." ON USERS
  FOR SELECT USING (AUTH.UID() = ID);

CREATE POLICY "Can update own user data." ON USERS
  FOR UPDATE USING (AUTH.UID() = ID);

/**
* This trigger automatically creates a user entry when a new user signs up via Supabase Auth.
*/
CREATE FUNCTION PUBLIC.HANDLE_NEW_USER(
) RETURNS TRIGGER AS
    $$     BEGIN INSERT INTO PUBLIC.USERS (
        ID,
        FULL_NAME,
        AVATAR_URL
    ) VALUES (
        NEW.ID,
        NEW.RAW_USER_META_DATA->>'full_name',
        NEW.RAW_USER_META_DATA->>'avatar_url'
    );
    RETURN NEW;
END;
$$     LANGUAGE PLPGSQL SECURITY DEFINER;
CREATE TRIGGER ON_AUTH_USER_CREATED AFTER INSERT ON AUTH.USERS FOR EACH ROW EXECUTE PROCEDURE PUBLIC.HANDLE_NEW_USER(
);
 /**
* CUSTOMERS
* Note: this is a private table that contains a mapping of user IDs to Strip customer IDs.
*/
 CREATE TABLE CUSTOMERS (
 -- UUID from auth.users
ID UUID REFERENCES AUTH.USERS NOT NULL PRIMARY KEY,
 -- The user's customer ID in Stripe. User must not be able to update this.
STRIPE_CUSTOMER_ID TEXT );
ALTER  TABLE CUSTOMERS ENABLE ROW LEVEL SECURITY;
 -- No policies as this is a private table that the user must not have access to.

 /**
* PRODUCTS
* Note: products are created and managed in Stripe and synced to our DB via Stripe webhooks.
*/
 CREATE TABLE PRODUCTS (
 -- Product ID from Stripe, e.g. prod_1234.
ID TEXT PRIMARY KEY,
 -- Whether the product is currently available for purchase.
ACTIVE BOOLEAN,
 -- The product's name, meant to be displayable to the customer. Whenever this product is sold via a subscription, name will show up on associated invoice line item descriptions.
NAME TEXT,
 -- The product's description, meant to be displayable to the customer. Use this field to optionally store a long form explanation of the product being sold for your own rendering purposes.
DESCRIPTION TEXT,
 -- A URL of the product image in Stripe, meant to be displayable to the customer.
IMAGE TEXT,
 -- Set of key-value pairs, used to store additional information about the object in a structured format.
METADATA JSONB );
ALTER  TABLE PRODUCTS ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access." ON PRODUCTS FOR
SELECT
    USING (TRUE);
 /**
* PRICES
* Note: prices are created and managed in Stripe and synced to our DB via Stripe webhooks.
*/
 CREATE TYPE PRICING_TYPE AS ENUM ('one_time', 'recurring');
CREATE TYPE PRICING_PLAN_INTERVAL AS ENUM ('day', 'week', 'month', 'year');
CREATE TABLE PRICES (
 -- Price ID from Stripe, e.g. price_1234.
ID TEXT PRIMARY KEY,
 -- The ID of the prduct that this price belongs to.
PRODUCT_ID TEXT REFERENCES PRODUCTS,
 -- Whether the price can be used for new purchases.
ACTIVE BOOLEAN,
 -- A brief description of the price.
DESCRIPTION TEXT,
 -- The unit amount as a positive integer in the smallest currency unit (e.g., 100 cents for US$1.00 or 100 for ¥100, a zero-decimal currency).
UNIT_AMOUNT BIGINT,
 -- Three-letter ISO currency code, in lowercase.
CURRENCY TEXT CHECK (CHAR_LENGTH(CURRENCY) = 3),
 -- One of `one_time` or `recurring` depending on whether the price is for a one-time purchase or a recurring (subscription) purchase.
TYPE PRICING_TYPE,
 -- The frequency at which a subscription is billed. One of `day`, `week`, `month` or `year`.
INTERVAL PRICING_PLAN_INTERVAL,
 -- The number of intervals (specified in the `interval` attribute) between subscription billings. For example, `interval=month` and `interval_count=3` bills every 3 months.
INTERVAL_COUNT INTEGER,
 -- Default number of trial days when subscribing a customer to this price using [`trial_from_plan=true`](https://stripe.com/docs/api#create_subscription-trial_from_plan).
TRIAL_PERIOD_DAYS INTEGER,
 -- Set of key-value pairs, used to store additional information about the object in a structured format.
METADATA JSONB );
ALTER  TABLE PRICES ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access." ON PRICES FOR
SELECT
    USING (TRUE);
 /**
* SUBSCRIPTIONS
* Note: subscriptions are created and managed in Stripe and synced to our DB via Stripe webhooks.
*/
 CREATE TYPE SUBSCRIPTION_STATUS AS ENUM ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid');
CREATE TABLE SUBSCRIPTIONS (
 -- Subscription ID from Stripe, e.g. sub_1234.
ID TEXT PRIMARY KEY, USER_ID UUID REFERENCES AUTH.USERS NOT NULL,
 -- The status of the subscription object, one of subscription_status type above.
STATUS SUBSCRIPTION_STATUS,
 -- Set of key-value pairs, used to store additional information about the object in a structured format.
METADATA JSONB,
 -- ID of the price that created this subscription.
PRICE_ID TEXT REFERENCES PRICES,
 -- Quantity multiplied by the unit amount of the price creates the amount of the subscription. Can be used to charge multiple seats.
QUANTITY INTEGER,
 -- If true the subscription has been canceled by the user and will be deleted at the end of the billing period.
CANCEL_AT_PERIOD_END BOOLEAN,
 -- Time at which the subscription was created.
CREATED TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
 -- Start of the current period that the subscription has been invoiced for.
CURRENT_PERIOD_START TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
 -- End of the current period that the subscription has been invoiced for. At the end of this period, a new invoice will be created.
CURRENT_PERIOD_END TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
 -- If the subscription has ended, the timestamp of the date the subscription ended.
ENDED_AT TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
 -- A date in the future at which the subscription will automatically get canceled.
CANCEL_AT TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
 -- If the subscription has been canceled, the date of that cancellation. If the subscription was canceled with `cancel_at_period_end`, `canceled_at` will still reflect the date of the initial cancellation request, not the end of the subscription period when the subscription is automatically moved to a canceled state.
CANCELED_AT TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
 -- If the subscription has a trial, the beginning of that trial.
TRIAL_START TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
 -- If the subscription has a trial, the end of that trial.
TRIAL_END TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) );
ALTER  TABLE SUBSCRIPTIONS ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Can only view own subs data." ON SUBSCRIPTIONS FOR
SELECT
    USING (AUTH.UID() = USER_ID);
 /**
 * REALTIME SUBSCRIPTIONS
 * Only allow realtime listening on public tables.
 */
 DROP   PUBLICATION IF EXISTS SUPABASE_REALTIME;
CREATE PUBLICATION SUPABASE_REALTIME FOR TABLE PRODUCTS, PRICES;