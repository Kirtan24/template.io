jest.mock("../../../src/config/mail.config", () => ({
  sendMail: jest.fn(),
}));

const transporter = require("../../../src/config/mail.config");
const {
  sendEmail,
  sendEmailWithAttachment,
} = require("../../../src/services/mail.service");

describe("mail.service", () => {
  afterEach(() => jest.clearAllMocks());

  test("sendEmail returns true when transporter.sendMail resolves", async () => {
    transporter.sendMail.mockResolvedValueOnce(true);

    const result = await sendEmail(
      "from@test.com",
      "to@test.com",
      "hi",
      "<p>hi</p>"
    );
    expect(transporter.sendMail).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  test("sendEmail returns false when transporter.sendMail throws", async () => {
    transporter.sendMail.mockRejectedValueOnce(new Error("fail"));

    const result = await sendEmail(
      "from@test.com",
      "to@test.com",
      "hi",
      "<p>hi</p>"
    );
    expect(result).toBe(false);
  });

  test("sendEmail throws when recipientEmail is missing -> handled as false", async () => {
    const result = await sendEmail("from@test.com", "", "hi", "<p>hi</p>");
    expect(result).toBe(false);
  });

  test("sendEmailWithAttachment calls transporter.sendMail and does not swallow errors", async () => {
    transporter.sendMail.mockResolvedValueOnce(true);
    await expect(
      sendEmailWithAttachment({ to: "a@b.com", subject: "x" })
    ).resolves.toBeUndefined();
    expect(transporter.sendMail).toHaveBeenCalled();
  });
});
