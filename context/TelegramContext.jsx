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

  /* ========================= 🌐 FETCH HELPER (POST JSON) ========================= */
  const apiFetch = async (endpoint, params = {}) => {
    const initData = getInitData();

    // ✅ TO'G'RI: JSON orqali yuborish (double encode muammosi yo'q)
    const body = {
      ...(initData ? { initData } : { user_id: DEV_USER_ID }),
      ...params,
    };

    console.group(`📡 POST → ${endpoint}`);
    console.log("📤 Request body:", body);
    console.log("🔑 initData present:", !!initData);
    console.groupEnd();

    let res;
    try {
      res = await fetch(`https://tezpremium.uz/webapp/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (networkErr) {
      console.error(`🔴 NETWORK ERROR [${endpoint}]:`, networkErr.message);
      throw networkErr;
    }

    console.log(`📥 Response status [${endpoint}]:`, res.status, res.statusText);

    let json;
    try {
      json = await res.json();
    } catch (parseErr) {
      console.error(`🔴 JSON PARSE ERROR [${endpoint}]:`, parseErr.message);
      throw parseErr;
    }

    console.group(`✅ Response JSON ← ${endpoint}`);
    console.log(JSON.stringify(json, null, 2));
    console.groupEnd();

    return json;
  };

  /* ========================= 👤 USER FETCH ========================= */
  const fetchUserFromApi = async () => {
    try {
      setLoading(true);
      console.log("👤 fetchUserFromApi → start");
      const data = await apiFetch("get_user.php");

      console.group("🔍 get_user.php parse");
      console.log("data.ok:", data.ok);
      console.log("data.data:", data.data);
      console.log("data.balance (top-level):", data.balance);
      console.log("data.data?.balance:", data.data?.balance);
      console.groupEnd();

      if (!data.ok) {
        console.warn("⚠️ get_user.php returned ok=false:", data);
      }

      const userData = data.ok
        ? { balance: data.data?.balance ?? data.balance ?? "0", ...data.data }
        : { balance: "0" };

      console.log("✅ apiUser set to:", userData);
      setApiUser(userData);
      return userData;
    } catch (err) {
      console.error("❌ fetchUserFromApi CATCH:", err.message);
      const fallback = { balance: "0" };
      setApiUser(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  /* ========================= 📦 ORDERS ========================= */
  const fetchOrders = async () => {
    try {
      console.log("📦 fetchOrders → start");
      const data = await apiFetch("history.php");

      console.group("🔍 history.php parse");
      console.log("data.ok:", data.ok);
      console.log("data.orders:", data.orders);
      console.groupEnd();

      setOrders(data.ok && Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      console.error("❌ fetchOrders CATCH:", err);
      setOrders([]);
    }
  };

  /* ========================= 💳 PAYMENTS ========================= */
  const fetchPayments = async () => {
    try {
      console.log("💳 fetchPayments → start");
      const data = await apiFetch("payments.php");

      console.group("🔍 payments.php parse");
      console.log("data.ok:", data.ok);
      console.log("data.payments:", data.payments);
      console.groupEnd();

      setPayments(data.ok && Array.isArray(data.payments) ? data.payments : []);
    } catch (err) {
      console.error("❌ fetchPayments CATCH:", err);
      setPayments([]);
    }
  };

  /* ========================= ⭐ ORDER ========================= */
  const createOrder = async ({ amount, sent, type, overall }) => {
    try {
      console.log("⭐ createOrder →", { amount, sent, type, overall });
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
      console.warn("⚠️ createOrder not ok:", data);
      return { ok: false };
    } catch (e) {
      console.error("❌ createOrder CATCH:", e.message);
      return { ok: false };
    }
  };

  /* ========================= 💎 PREMIUM ========================= */
  const createPremiumOrder = async ({ months, sent, overall }) => {
    try {
      console.log("💎 createPremiumOrder →", { months, sent, overall });
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
      console.warn("⚠️ createPremiumOrder not ok:", data);
      return { ok: false, message: data.message };
    } catch (e) {
      console.error("❌ createPremiumOrder CATCH:", e.message);
      return { ok: false, message: e.message };
    }
  };

  /* ========================= 🎁 GIFT ORDER ========================= */
  const createGiftOrder = async ({ giftId, sent, price }) => {
    try {
      console.log("🎁 createGiftOrder →", { giftId, sent, price });
      const balance = Number(apiUser?.balance || 0);
      console.log("💰 Current balance:", balance, "| Required:", price);

      if (balance < price) {
        console.warn("⚠️ Insufficient balance");
        return { ok: false, message: "Balans yetarli emas" };
      }
      const cleanUsername = sent.startsWith("@") ? sent : `@${sent}`;
      const data = await apiFetch("gifting.php", {
        gift_id: giftId,
        sent: cleanUsername,
      });
      if (!data?.ok) {
        console.warn("⚠️ createGiftOrder not ok:", data);
        return { ok: false, message: data?.message || "Gift xatosi" };
      }
      await fetchUserFromApi();
      await fetchOrders();
      return { ok: true, data };
    } catch (e) {
      console.error("❌ createGiftOrder CATCH:", e.message);
      return { ok: false, message: e.message };
    }
  };

  /* ========================= 🔄 REFRESH ========================= */
  const refreshUser = async () => {
    console.log("🔄 refreshUser → start");
    await fetchUserFromApi();
    await fetchOrders();
    await fetchPayments();
  };

  /* ========================= 🚀 INIT ========================= */
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const telegram = window.Telegram?.WebApp;
    console.group("🚀 INIT");
    console.log("Telegram WebApp present:", !!telegram);
    console.log("initData:", telegram?.initData || "NONE");
    console.log("initDataUnsafe.user:", telegram?.initDataUnsafe?.user || "NONE");
    console.groupEnd();

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
      console.warn("⚠️ No Telegram user → using DEV_USER_ID:", DEV_USER_ID);
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