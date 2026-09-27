import { CONTACT_EMAIL, type LegalDoc } from "./types";

export const privacy: LegalDoc = {
  updated: "2026-09-28",
  sections: {
    en: [
      {
        heading: "1. About this policy",
        paragraphs: [
          "LLs (\"we\") offers simple language-learning mini games for children and families. This policy explains what information is handled when you use LLs. It is written for parents and guardians.",
        ],
      },
      {
        heading: "2. Built for children: we don't collect personal data",
        paragraphs: ["LLs works without an account. We do not ask for or collect:"],
        list: [
          "names, email addresses, phone numbers or photos",
          "voice recordings or camera access",
          "precise location",
          "advertising identifiers or tracking cookies",
        ],
      },
      {
        heading: "3. Data saved only on your device",
        paragraphs: [
          "To remember progress, LLs stores the following in your browser (localStorage and IndexedDB). This data stays on your device and is never sent to us:",
        ],
        list: [
          "game history, scores, stickers and badges",
          "words to practice (review list)",
          "settings: language to learn, sound, voice, theme, timer",
          "a language cookie (NEXT_LOCALE) so the site opens in your language – strictly necessary, no tracking",
        ],
      },
      {
        heading: "4. Deleting data",
        paragraphs: [
          "Open the grown-ups area and choose \"Delete all progress\", or clear this site's data in your browser settings. Because we don't hold your data on our servers, there is nothing else to delete.",
        ],
      },
      {
        heading: "5. Technical data from hosting",
        paragraphs: [
          "LLs is hosted by Vercel. Like any website, the hosting provider processes technical request data (such as IP address, browser type and time of request) to deliver pages and protect the service against abuse. We do not use this data to identify or profile anyone. See Vercel's privacy policy for details.",
        ],
      },
      {
        heading: "6. No ads, no analytics tracking, no selling data",
        paragraphs: [
          "LLs shows no advertising and contains no third-party trackers. We never sell or share personal data. If we add usage statistics in the future, we will only use privacy-friendly, cookie-free, aggregated analytics and update this policy first.",
        ],
      },
      {
        heading: "7. Read-aloud voice",
        paragraphs: [
          "Words are read aloud using your device's built-in speech feature. Only the word being read (for example \"cat\") is passed to that feature. Some operating systems may use their own online voice service; this is controlled by your device settings. You can turn the voice off in the grown-ups area.",
        ],
      },
      {
        heading: "8. Children's privacy laws",
        paragraphs: [
          "We design LLs to follow the principles of children's privacy laws such as COPPA (United States), the GDPR and UK Age Appropriate Design Code (Europe/UK), and Vietnam's personal data protection law: data minimisation, no profiling, no behavioural advertising, and privacy by default. We do not knowingly collect personal information from children. If you believe a child has sent us personal information (for example by email), contact us and we will delete it.",
        ],
      },
      {
        heading: "9. Security",
        paragraphs: [
          "LLs is served only over HTTPS with strict security headers, loads no third-party scripts, and keeps settings behind a parental gate.",
        ],
      },
      {
        heading: "10. Changes",
        paragraphs: [
          "We may update this policy. The date at the top shows the latest version. Important changes will be announced on the site before they take effect.",
        ],
      },
      { heading: "11. Contact", paragraphs: [`Questions or requests: ${CONTACT_EMAIL}`] },
    ],
    vi: [
      {
        heading: "1. Về chính sách này",
        paragraphs: [
          "LLs (\"chúng tôi\") cung cấp các mini game học ngôn ngữ đơn giản cho trẻ em và gia đình. Chính sách này giải thích những thông tin được xử lý khi bạn sử dụng LLs, được viết dành cho phụ huynh và người giám hộ.",
        ],
      },
      {
        heading: "2. Dành cho trẻ em: chúng tôi không thu thập dữ liệu cá nhân",
        paragraphs: ["LLs hoạt động không cần tài khoản. Chúng tôi không yêu cầu hay thu thập:"],
        list: [
          "họ tên, email, số điện thoại hay ảnh",
          "ghi âm giọng nói hay quyền truy cập camera",
          "vị trí chính xác",
          "mã định danh quảng cáo hay cookie theo dõi",
        ],
      },
      {
        heading: "3. Dữ liệu chỉ lưu trên thiết bị của bạn",
        paragraphs: [
          "Để ghi nhớ tiến độ, LLs lưu các thông tin sau trong trình duyệt (localStorage và IndexedDB). Dữ liệu này nằm trên thiết bị của bạn và không bao giờ được gửi cho chúng tôi:",
        ],
        list: [
          "lịch sử chơi, điểm, sticker và huy hiệu",
          "danh sách từ cần ôn lại",
          "cài đặt: ngôn ngữ học, âm thanh, giọng đọc, giao diện, thời gian đếm ngược",
          "một cookie ngôn ngữ (NEXT_LOCALE) để trang mở đúng ngôn ngữ của bạn – bắt buộc về kỹ thuật, không dùng để theo dõi",
        ],
      },
      {
        heading: "4. Xoá dữ liệu",
        paragraphs: [
          "Vào khu vực phụ huynh và chọn \"Xoá toàn bộ tiến độ\", hoặc xoá dữ liệu trang web trong cài đặt trình duyệt. Vì chúng tôi không lưu dữ liệu của bạn trên máy chủ nên không còn gì khác cần xoá.",
        ],
      },
      {
        heading: "5. Dữ liệu kỹ thuật từ dịch vụ lưu trữ",
        paragraphs: [
          "LLs được lưu trữ trên Vercel. Như mọi website, nhà cung cấp lưu trữ xử lý dữ liệu kỹ thuật của yêu cầu truy cập (như địa chỉ IP, loại trình duyệt, thời gian truy cập) để phân phối trang và bảo vệ dịch vụ khỏi lạm dụng. Chúng tôi không dùng dữ liệu này để nhận diện hay lập hồ sơ bất kỳ ai. Xem chính sách quyền riêng tư của Vercel để biết thêm.",
        ],
      },
      {
        heading: "6. Không quảng cáo, không theo dõi, không bán dữ liệu",
        paragraphs: [
          "LLs không hiển thị quảng cáo và không chứa công cụ theo dõi của bên thứ ba. Chúng tôi không bao giờ bán hay chia sẻ dữ liệu cá nhân. Nếu sau này bổ sung thống kê sử dụng, chúng tôi chỉ dùng loại tổng hợp, không cookie, thân thiện với quyền riêng tư và sẽ cập nhật chính sách này trước.",
        ],
      },
      {
        heading: "7. Giọng đọc",
        paragraphs: [
          "Từ vựng được đọc to bằng tính năng đọc văn bản có sẵn trên thiết bị. Chỉ từ đang được đọc (ví dụ \"cat\") được chuyển cho tính năng này. Một số hệ điều hành có thể dùng dịch vụ giọng đọc trực tuyến riêng, tuỳ theo cài đặt thiết bị. Bạn có thể tắt giọng đọc trong khu vực phụ huynh.",
        ],
      },
      {
        heading: "8. Luật bảo vệ quyền riêng tư của trẻ em",
        paragraphs: [
          "LLs được thiết kế theo các nguyên tắc của luật bảo vệ quyền riêng tư trẻ em như COPPA (Hoa Kỳ), GDPR và Bộ quy tắc thiết kế phù hợp độ tuổi (Châu Âu/Anh), và pháp luật bảo vệ dữ liệu cá nhân của Việt Nam: tối thiểu hoá dữ liệu, không lập hồ sơ, không quảng cáo theo hành vi, mặc định bảo vệ quyền riêng tư. Chúng tôi không cố ý thu thập thông tin cá nhân của trẻ em. Nếu bạn cho rằng trẻ đã gửi thông tin cá nhân cho chúng tôi (ví dụ qua email), hãy liên hệ để chúng tôi xoá.",
        ],
      },
      {
        heading: "9. Bảo mật",
        paragraphs: [
          "LLs chỉ phục vụ qua HTTPS với các header bảo mật chặt chẽ, không tải script của bên thứ ba, và đặt phần cài đặt sau khoá phụ huynh.",
        ],
      },
      {
        heading: "10. Thay đổi",
        paragraphs: [
          "Chúng tôi có thể cập nhật chính sách này. Ngày ở đầu trang cho biết phiên bản mới nhất. Thay đổi quan trọng sẽ được thông báo trên trang trước khi có hiệu lực.",
        ],
      },
      { heading: "11. Liên hệ", paragraphs: [`Câu hỏi hoặc yêu cầu: ${CONTACT_EMAIL}`] },
    ],
  },
  paidSections: {
    en: [
      {
        heading: "Parent accounts and LLs Plus",
        paragraphs: [
          "If you subscribe to LLs Plus, we create a parent account with your email address only. We never ask for a child's name or personal details. Account data is used to provide the subscription and sync progress, and is deleted within 30 days after you close the account.",
          "Payments are processed by our payment partner acting as merchant of record. We never see or store your full card number. We receive only the subscription status and the information needed for tax and accounting.",
        ],
      },
    ],
    vi: [
      {
        heading: "Tài khoản phụ huynh và LLs Plus",
        paragraphs: [
          "Nếu bạn đăng ký LLs Plus, chúng tôi tạo tài khoản phụ huynh chỉ với địa chỉ email của bạn. Chúng tôi không bao giờ hỏi tên hay thông tin cá nhân của trẻ. Dữ liệu tài khoản dùng để cung cấp gói đăng ký và đồng bộ tiến độ, và được xoá trong vòng 30 ngày sau khi bạn đóng tài khoản.",
          "Thanh toán được xử lý bởi đối tác thanh toán đóng vai trò người bán (merchant of record). Chúng tôi không bao giờ thấy hay lưu số thẻ đầy đủ của bạn, chỉ nhận trạng thái gói đăng ký và thông tin cần thiết cho thuế và kế toán.",
        ],
      },
    ],
  },
};
