
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:8080";

export default function App() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("recall.officer");
  const [password, setPassword] = useState("demo123");
  const [workflow, setWorkflow] = useState([]);
  const [lotsSeeded, setLotsSeeded] = useState(false);
  const [stockSeeded, setStockSeeded] = useState(false);
  const [lotCode, setLotCode] = useState("LOT-A100");
  const [productCode, setProductCode] = useState("MED-100");
  const [reason, setReason] = useState("simulated supplier quality alert");
  const [message, setMessage] = useState("Log in to connect to your backend.");
  const [busy, setBusy] = useState(false);

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      throw new Error(
        data?.message || data?.error || `Request failed (${response.status})`
      );
    }
    return data;
  }

  async function login(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      if (!result.token) throw new Error("Login response did not contain a token.");
      setToken(result.token);
      setMessage("Login successful. Connected to the API Gateway.");
    } catch (error) {
      setMessage(`Login failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function loadWorkflow(currentToken = token) {
    if (!currentToken) {
      setMessage("Please log in first.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`${API}/workflow`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`);
      setWorkflow(Array.isArray(data) ? data : []);
      setMessage("Workflow data refreshed successfully.");
    } catch (error) {
      setMessage(`Could not load workflow: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function seed(path, label, onSuccess) {
    setBusy(true);
    try {
      const result = await request(path, {
        method: "POST",
        body: JSON.stringify({}),
      });
      onSuccess(true);
      setMessage(`${label}: ${JSON.stringify(result)}`);
    } catch (error) {
      setMessage(`${label} failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function createRecall(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await request("/recall", {
        method: "POST",
        body: JSON.stringify({ lotCode, productCode, reason }),
      });
      setMessage(`Recall submitted: ${JSON.stringify(result)}`);
      await loadWorkflow(token);
    } catch (error) {
      setMessage(`Recall failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (token) loadWorkflow(token);
  }, [token]);

  const quarantined = workflow.filter(
    (item) => item.status === "QUARANTINED"
  ).length;

  return (
    <main className="dashboard">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">✚</div>
          <div>
            <h1>PharmaRecall</h1>
            <p>Shelf Recall Routing System</p>
          </div>
        </div>
        <span className={`connection ${token ? "online" : ""}`}>
          <span className="dot" />
          {token ? "Authenticated" : "Not connected"}
        </span>
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">OPERATIONS OVERVIEW</p>
          <h2>Recall Management Dashboard</h2>
          <p>Monitor product lots, shelf stock and recall workflows in one place.</p>
        </div>
        <button className="secondary" disabled={busy || !token} onClick={() => loadWorkflow()}>
          ↻ Refresh data
        </button>
      </section>

      <section className="stats">
        <article className="stat-card">
          <span>Product lots seeded</span>
          <strong>{lotsSeeded ? "✓" : "—"}</strong>
          <small>{lotsSeeded ? "Seed request completed" : "Not seeded in this session"}</small>
        </article>
        <article className="stat-card">
          <span>Shelf stock seeded</span>
          <strong>{stockSeeded ? "✓" : "—"}</strong>
          <small>{stockSeeded ? "Seed request completed" : "Not seeded in this session"}</small>
        </article>
        <article className="stat-card">
          <span>Workflow events</span>
          <strong>{workflow.length}</strong>
          <small>Records returned by the API</small>
        </article>
        <article className="stat-card">
          <span>Quarantined events</span>
          <strong>{quarantined}</strong>
          <small>Workflow status equals QUARANTINED</small>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h3>Backend authentication</h3>
              <p>Use your existing recall officer account.</p>
            </div>
            <span className="tag">JWT</span>
          </div>
          <form onSubmit={login} className="form">
            <label>
              Username
              <input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <button disabled={busy} type="submit">{busy ? "Please wait…" : "Log in"}</button>
          </form>
          {token && <p className="success">JWT received. Protected API requests are enabled.</p>}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <h3>Initialize demo data</h3>
              <p>These buttons call your existing seed endpoints.</p>
            </div>
          </div>
          <div className="action-row">
            <button disabled={busy || !token} onClick={() => seed("/lots/seed", "Product lot seeding", setLotsSeeded)}>
              Seed product lots
            </button>
            <button className="secondary" disabled={busy || !token} onClick={() => seed("/stock/seed", "Shelf stock seeding", setStockSeeded)}>
              Seed shelf stock
            </button>
          </div>
          <p className="hint">Log in first. Seed actions may create or update backend records.</p>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <h3>Create a recall</h3>
              <p>Submit a recall event through the gateway.</p>
            </div>
            <span className="tag">POST /recall</span>
          </div>
          <form onSubmit={createRecall} className="form">
            <label>
              Lot code
              <input value={lotCode} onChange={(e) => setLotCode(e.target.value)} required />
            </label>
            <label>
              Product code
              <input value={productCode} onChange={(e) => setProductCode(e.target.value)} required />
            </label>
            <label>
              Reason
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} required rows={3} />
            </label>
            <button disabled={busy || !token} type="submit">Submit recall</button>
          </form>
        </article>

        <article className="panel workflow-panel">
          <div className="panel-heading">
            <div>
              <h3>Recall workflow history</h3>
              <p>Latest records returned by GET /workflow.</p>
            </div>
            <span className="tag">{workflow.length} records</span>
          </div>
          {workflow.length === 0 ? (
            <div className="empty">
              <span>▤</span>
              <strong>No workflow records loaded</strong>
              <p>Log in and refresh the workflow data.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Lot / Event</th>
                    <th>Status</th>
                    <th>Correlation ID</th>
                    <th>Consumed at</th>
                  </tr>
                </thead>
                <tbody>
                  {workflow.map((item, index) => (
                    <tr key={item.eventId || index}>
                      <td>
                        <strong>{item.aggregateId || "—"}</strong>
                        <small>{item.eventId || "No event ID"}</small>
                      </td>
                      <td>
                        <span className={`status ${item.status === "QUARANTINED" ? "quarantined" : ""}`}>
                          {item.status || "UNKNOWN"}
                        </span>
                      </td>
                      <td className="id-cell">{item.correlationId || "—"}</td>
                      <td>{item.consumedAt ? new Date(item.consumedAt).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>

      <div className="notification" role="status">
        <span className="notification-icon">i</span>
        <div>
          <strong>System message</strong>
          <p>{message}</p>
        </div>
      </div>

      <footer>PharmaRecall · Academic SOA demonstration · Data is provided by your backend APIs</footer>
    </main>
  );
}
