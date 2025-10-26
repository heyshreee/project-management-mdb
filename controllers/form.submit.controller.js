const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.submitForm = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required" });
  }

  try {
    const body = new URLSearchParams();
    body.append("Name", name);
    body.append("Email", email);
    body.append("Message", message);

    const response = await fetch(process.env.SPREADSHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      redirect: "follow"
    });

    const text = await response.text();
    res.status(200).json({ message: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit form" });
  }
};
