import { createContext, useContext, useEffect, useState, useRef } from "react";

const TelegramContext = createContext(null);

const DEV_USER_ID = "7521806735";

export const TelegramProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [apiUser, setApiUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  const getInitData = () => {
    const initData = window.Telegram?.WebApp?.initData;
    return initData && initData.length > 0 ? initData : null;
  };

  const apiFetch = async (endpoint, params = {}) => {
    const initData = getInitData();

    const body = {
      initData: initData ?? `user_id=${DEV_USER_ID}`,
      ...params,
    };

    let res;
    try {
      res = await fetch(`https://tezpremium.uz/webapp/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (networkErr) {
      throw networkErr;
    }

    let json;
    try {
      json = await res.json();
    } catch (parseErr) {
      throw parseErr;
    }

    return json;
  };

  const fetchUserFromApi = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("get_user.php");

      const userData = data.ok
        ? { balance: data.data?.balance ?? data.balance ?? "0", ...data.data }
        : { balance: "0" };

      setApiUser(userData);
      return userData;
    } catch (err) {
      const fallback = { balance: "0" };
      setApiUser(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await apiFetch("history.php");
      setOrders(data.ok && Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setOrders([]);
    }
  };

  const fetchPayments = async () => {
    try {
      const data = await apiFetch("payments.php");
      setPayments(data.ok && Array.isArray(data.payments) ? data.payments : []);
    } catch (err) {
      setPayments([]);
    }
  };

  const createOrder = async ({ amount, sent, type, overall }) => {
    try {
      const data = await apiFetch("order.php", {
        amount,
        sent: `@${sent.replace("@", "")}`,
        type,
        overall,
      });
      if (data.ok) {
        await fetchUserFromApi();
        await fetchOrders();
        return { ok: true };
      }
      return { ok: false };
    } catch (e) {
      return { ok: false };
    }
  };

  const createPremiumOrder = async ({ months, sent, overall }) => {
    try {
      const data = await apiFetch("premium.php", {
        amount: months,
        sent: sent.replace("@", ""),
        overall,
      });
      if (data.ok) {
        await fetchUserFromApi();
        await fetchOrders();
        return { ok: true, ...data };
      }
      return { ok: false, message: data.message };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  };

  const createGiftOrder = async ({ giftId, sent, price }) => {
    try {
      const balance = Number(apiUser?.balance || 0);

      if (balance < price) {
        return { ok: false, message: "Balans yetarli emas" };
      }
      const cleanUsername = sent.startsWith("@") ? sent : `@${sent}`;
      const data = await apiFetch("gifting.php", {
        gift_id: giftId,
        sent: cleanUsername,
      });
      if (!data?.ok) {
        return { ok: false, message: data?.message || "Gift xatosi" };
      }
      await fetchUserFromApi();
      await fetchOrders();
      return { ok: true, data };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  };

  const refreshUser = async () => {
    await fetchUserFromApi();
    await fetchOrders();
    await fetchPayments();
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const telegram = window.Telegram?.WebApp;

    if (telegram) {
      telegram.ready();
      telegram.expand();
    }

    const tgUser = telegram?.initDataUnsafe?.user;

    if (tgUser?.id) {
      setUser({
        id: tgUser.id,
        first_name: tgUser.first_name || "",
        last_name: tgUser.last_name || "",
        username: tgUser.username ? `@${tgUser.username}` : "",
        photo_url: tgUser.photo_url || null,
        isTelegram: true,
      });
    } else {
      setUser({
        id: DEV_USER_ID,
        first_name: "Dev",
        username: "@dev_user",
        photo_url: null,
        isTelegram: false,
      });
    }

    (async () => {
      await fetchUserFromApi();
      await fetchOrders();
      await fetchPayments();
    })();
  }, []);

  return (
    <TelegramContext.Provider
      value={{
        user,
        apiUser,
        orders,
        payments,
        loading,
        createOrder,
        createPremiumOrder,
        createGiftOrder,
        refreshUser,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const ctx = useContext(TelegramContext);
  if (!ctx) throw new Error("useTelegram must be used inside provider");
  return ctx;
};