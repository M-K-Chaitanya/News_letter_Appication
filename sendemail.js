const nodemailer = require("nodemailer");
const { marked } = require("marked");
require("dotenv").config();

// --- Supabase setup ---
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase credentials missing in .env file.");
}
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Environment variables ---
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// --- Fetch latest tech news ---
async function fetchLatestTechNews() {
  try {
    const response = await fetch(`https://newsapi.org/v2/everything?q=technology OR AI OR programming OR software&domains=techcrunch.com,arstechnica.com,wired.com,theverge.com&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`);
    
    if (!response.ok) {
      console.log("NewsAPI unavailable, using fallback sources...");
      return await fetchFallbackTechNews();
    }

    const data = await response.json();
    return data.articles.slice(0, 3).map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: new Date(article.publishedAt).toLocaleDateString(),
      source: article.source.name
    }));
  } catch (error) {
    console.error("Error fetching tech news:", error);
    return await fetchFallbackTechNews();
  }
}

// Fallback tech news
async function fetchFallbackTechNews() {
  const trendingTopics = [
    "Latest advancements in AI and Machine Learning are revolutionizing industries from healthcare to autonomous vehicles.",
    "Cloud computing trends show serverless architecture gaining massive adoption among Fortune 500 companies.",
    "Quantum computing breakthroughs are bringing us closer to solving complex problems in cryptography and drug discovery.",
  ];
  
  return [{
    title: "Tech Industry Spotlight",
    description: trendingTopics[Math.floor(Math.random() * trendingTopics.length)],
    url: "#",
    publishedAt: new Date().toLocaleDateString(),
    source: "TechMaster Insights"
  }];
}

// --- Dynamic content pools ---
const getRandomOSConcept = () => {
  const concepts = [
    {
      concept: "Process Scheduling Algorithms",
      realWorldAnalogy: "Think of a hospital emergency room where patients with different urgency levels need attention. The triage nurse (scheduler) decides who gets treated first based on priority, just like how the OS scheduler decides which process gets CPU time.",
      technicalExplanation: "Process scheduling algorithms determine the order in which processes are executed. Key algorithms include: 1) First-Come-First-Serve (FCFS), 2) Shortest Job First (SJF), 3) Round Robin, and 4) Priority Scheduling. Modern OS use multilevel feedback queues combining multiple algorithms.",
      whyItMatters: "Efficient scheduling directly impacts system performance, responsiveness, and user experience. Poor scheduling can lead to starvation or poor throughput."
    },
    {
      concept: "Virtual Memory Management",
      realWorldAnalogy: "Imagine your desk (RAM) is small, but you have a large filing cabinet (hard drive). When you need a document not on your desk, you swap it with something you\"'re not currently using. Virtual memory works similarly, swapping data between RAM and storage.",
      technicalExplanation: "Virtual memory allows systems to use more memory than physically available by using disk storage as an extension. Key components include page tables, the Translation Lookaside Buffer (TLB), and page replacement algorithms like LRU.",
      whyItMatters: "Virtual memory enables running large applications on systems with limited RAM, provides memory protection between processes, and allows efficient memory sharing."
    }
  ];
  return concepts[Math.floor(Math.random() * concepts.length)];
};

const getRandomDSAProblem = () => {
  const problems = [
    {
      leetCodeInfo: "LeetCode #1. Two Sum - Easy",
      problemStatement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      intuition: "The key insight is to use a hash map to store numbers we\"'ve seen and their indices. For each number, we check if its complement (target - current_number) exists in our map. This avoids a nested loop.",
      stepByStepApproach: "1. Create a HashMap. 2. Iterate through the array. 3. Calculate complement = target - current number. 4. If complement is in the map, return its index and the current index. 5. Otherwise, add the current number and its index to the map.",
      codeExample: `class Solution {\\n  public int[] twoSum(int[] nums, int target) {\\n    Map<Integer, Integer> map = new HashMap<>();\\n    for (int i = 0; i < nums.length; i++) {\\n      int complement = target - nums[i];\\n      if (map.containsKey(complement)) {\\n        return new int[]{map.get(complement), i};\\n      }\\n      map.put(nums[i], i);\\n    }\\n    return new int[]{}; // No solution\\n  }\\n}\\n// Time: O(n), Space: O(n)`
    },
    {
      leetCodeInfo: "LeetCode #121. Best Time to Buy and Sell Stock - Easy",
      problemStatement: "You are given an array where prices[i] is the price of a stock on day i. Find the maximum profit by choosing a single day to buy and a different day in the future to sell.",
      intuition: "We want to find the lowest buy price and the highest sell price after that day. We can solve this in one pass by tracking the minimum price seen so far and the maximum profit found.",
      stepByStepApproach: "1. Initialize minPrice to the first price and maxProfit to 0. 2. Iterate through the prices. 3. If the current price is less than minPrice, update minPrice. 4. Otherwise, calculate the potential profit and update maxProfit if it\"'s higher.",
      codeExample: `class Solution {\\n  public int maxProfit(int[] prices) {\\n    int minPrice = Integer.MAX_VALUE;\\n    int maxProfit = 0;\\n    for (int price : prices) {\\n      if (price < minPrice) {\\n        minPrice = price;\\n      } else if (price - minPrice > maxProfit) {\\n        maxProfit = price - minPrice;\\n      }\\n    }\\n    return maxProfit;\\n  }\\n}\\n// Time: O(n), Space: O(1)`
    }
  ];
  return problems[Math.floor(Math.random() * problems.length)];
};

const getRandomDBMSConcept = () => {
  const concepts = [
    {
      topic: "Normalization",
      explanation: "Normalization is the process of organizing the columns and tables of a relational database to minimize data redundancy and improve data integrity. It involves a series of guidelines called normal forms (1NF, 2NF, 3NF, BCNF, etc.).",
      sqlQuestion: "Consider a table `Orders (OrderID, CustomerName, CustomerAddress, OrderDate, ProductName, Quantity, Price)`. Identify the issues and normalize this table to 3NF.",
      sqlSolution: `--- Original Table: Orders\n--- OrderID (PK), CustomerName, CustomerAddress, OrderDate, ProductName, Quantity, Price\n\n--- 1NF: Ensure atomic values, no repeating groups.\n--- (Already in 1NF if each cell contains a single value)\n\n--- 2NF: Be in 1NF and all non-key attributes must be fully dependent on the primary key.\n--- Create Customers table\nCREATE TABLE Customers (\n    CustomerID INT PRIMARY KEY AUTO_INCREMENT,\n    CustomerName VARCHAR(255),\n    CustomerAddress VARCHAR(255)\n);\n\n--- Create Products table\nCREATE TABLE Products (\n    ProductID INT PRIMARY KEY AUTO_INCREMENT,\n    ProductName VARCHAR(255),\n    Price DECIMAL(10, 2)\n);\n\n--- Create Orders table (linking to Customers)\nCREATE TABLE Orders (\n    OrderID INT PRIMARY KEY AUTO_INCREMENT,\n    CustomerID INT,\n    OrderDate DATE,\n    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)\n);\n\n--- Create OrderDetails table (linking Orders and Products)\nCREATE TABLE OrderDetails (\n    OrderDetailID INT PRIMARY KEY AUTO_INCREMENT,\n    OrderID INT,\n    ProductID INT,\n    Quantity INT,\n    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),\n    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)\n);`,
      benefits: "Reduces data redundancy, improves data integrity, simplifies database maintenance."
    },
    {
      topic: "ACID Properties",
      explanation: "ACID (Atomicity, Consistency, Isolation, Durability) is a set of properties that guarantee that database transactions are processed reliably. Atomicity ensures all or nothing. Consistency ensures valid state. Isolation ensures concurrent transactions don\"'t interfere. Durability ensures committed data survives failures.",
      sqlQuestion: "Explain a scenario where violating one of the ACID properties could lead to data corruption or inconsistency. Provide a simple example.",
      sqlSolution: `--- Example of Atomicity violation (money transfer)\n--- If transfer fails mid-way, money is debited from A but not credited to B.\n\nBEGIN TRANSACTION;\nUPDATE Accounts SET Balance = Balance - 100 WHERE AccountID = \"A\";\n--- Simulate a crash here\nUPDATE Accounts SET Balance = Balance + 100 WHERE AccountID = \"B\";\nCOMMIT; --- If crash before commit, transaction should rollback (Atomicity)\n\n--- Example of Isolation violation (dirty read)\n--- Transaction 1 reads uncommitted data from Transaction 2, then Transaction 2 rolls back.\n\n--- Transaction 1\nSELECT Balance FROM Accounts WHERE AccountID = \"X\"; --- Reads 1000\n\n--- Transaction 2 (concurrently)\nBEGIN TRANSACTION;\nUPDATE Accounts SET Balance = Balance - 100 WHERE AccountID = \"X\"; --- Balance becomes 900\n--- Transaction 1 reads 900 (dirty read)\nROLLBACK; --- Balance reverts to 1000\n\n--- Now Transaction 1 has incorrect data (900 instead of 1000)\n`,
      benefits: "Ensures data reliability, integrity, and consistency in transactional systems."
    }
  ];
  return concepts[Math.floor(Math.random() * concepts.length)];
};

const getRandomCNConcept = () => {
  const concepts = [
    {
      concept: "TCP vs UDP",
      everydayExample: "Imagine sending a very important package (TCP) vs. shouting across a crowded room (UDP). With the package, you get confirmation it arrived, and if not, you resend. Shouting, you just hope they heard you.",
      technicalDetails: "TCP (Transmission Control Protocol) is connection-oriented, reliable, ordered, and error-checked. It uses handshakes, acknowledgements, and retransmissions. UDP (User Datagram Protocol) is connectionless, unreliable, and faster. It just sends data without guarantees.",
      practicalImportance: "TCP is used for web browsing (HTTP/HTTPS), email (SMTP), file transfer (FTP) where reliability is crucial. UDP is used for streaming video/audio, online gaming, DNS where speed is more important than guaranteed delivery of every packet."
    },
    {
      concept: "DNS (Domain Name System)",
      everydayExample: "Think of DNS as the internet\\\"'s phonebook. When you type a website name like google.com, DNS translates that human-readable name into an IP address (like 172.217.160.142) that computers understand.",
      technicalDetails: "DNS is a hierarchical and decentralized naming system. When you type a URL, your computer queries a local DNS resolver, which then queries root, TLD, and authoritative nameservers to find the correct IP address. Results are cached to speed up future lookups.",
      practicalImportance: "DNS is fundamental to how the internet works, enabling users to access websites and services using memorable domain names instead of complex IP addresses. Without it, navigating the web would be nearly impossible."
    }
  ];
  return concepts[Math.floor(Math.random() * concepts.length)];
};

const getRandomOOPsConcept = () => {
  const concepts = [
    {
      principle: "Encapsulation",
      realLifeAnalogy: "Think of a car. You know how to drive it (accelerate, brake, steer), but you don\\\"'t need to know how the engine works internally to operate it. The internal complexities are hidden, and you interact through a well-defined interface (steering wheel, pedals).",
      codeExample: `// Java Example\\npublic class BankAccount {\\n    private double balance; // Private: internal state hidden\\n\\n    public BankAccount(double initialBalance) {\\n        if (initialBalance >= 0) {\\n            this.balance = initialBalance;\\n        } else {\\n            this.balance = 0;\\n        }\\n    }\\n\\n    // Public method to deposit: controlled access\\n    public void deposit(double amount) {\\n        if (amount > 0) {\\n            this.balance += amount;\\n            System.out.println(\"Deposited: \" + amount + \", New Balance: \" + this.balance);\\n        } else {\\n            System.out.println(\"Deposit amount must be positive.\");\\n        }\\n    }\\n\\n    // Public method to withdraw: controlled access\\n    public void withdraw(double amount) {\\n        if (amount > 0 && this.balance >= amount) {\\n            this.balance -= amount;\\n            System.out.println(\"Withdrew: \" + amount + \", New Balance: \" + this.balance);\\n        } else {\\n            System.out.println(\"Invalid withdrawal amount or insufficient balance.\");\\n        }\\n    }\\n\\n    // Public method to get balance: controlled read access\\n    public double getBalance() {\\n        return this.balance;\\n    }\\n}\\n\\n// Usage\\n// BankAccount myAccount = new BankAccount(1000);\\n// myAccount.deposit(200);\\n// myAccount.withdraw(500);\\n// System.out.println(myAccount.getBalance());`,
      bestPractices: "1. Declare instance variables as private. 2. Provide public getter and setter methods for controlled access. 3. Use constructors to initialize objects safely."
    },
    {
      principle: "Inheritance",
      realLifeAnalogy: "Consider a family tree. Children inherit traits from their parents. In programming, a \\\"child\\\" class can inherit properties and methods from a \\\"parent\\\" class, reusing code and establishing a natural hierarchy.",
      codeExample: `// Java Example\\nclass Vehicle {\\n    String brand = \"Ford\";\\n    public void honk() {\\n        System.out.println(\"Tuut, tuut!\");\\n    }\\n}\\n\\nclass Car extends Vehicle {\\n    String modelName = \"Mustang\";\\n    public static void main(String[] args) {\\n        Car myCar = new Car();\\n        myCar.honk(); // Inherited method\\n        System.out.println(myCar.brand + \" \" + myCar.modelName);\\n    }\\n}\\n// Output:\\n// Tuut, tuut!\\n// Ford Mustang`,
      bestPractices: "1. Use inheritance for \\\"is-a\\\" relationships. 2. Avoid deep inheritance hierarchies. 3. Favor composition over inheritance when appropriate."
    }
  ];
  return concepts[Math.floor(Math.random() * concepts.length)];
};

const getRandomAptitudeConcept = () => {
  const concepts = [
    {
      topic: "Time and Work (Quantitative Aptitude)",
      introduction: "Time and Work problems involve calculating the time taken by individuals or groups to complete a certain amount of work. The core idea is that work done is directly proportional to time taken and efficiency.",
      formulaExplanation: "If a person can do a piece of work in \"'n\"' days, then the work done by that person in one day is 1/n. If two people A and B can do a work in \"'x\"' and \"'y\"' days respectively, together they can do it in (x*y)/(x+y) days.",
      solvedExample: "Problem: A can do a piece of work in 10 days and B can do the same work in 15 days. How many days will they take to complete the work together?\\n\\nSolution:\\n1. Work done by A in one day = 1/10\\n2. Work done by B in one day = 1/15\\n3. Work done by (A+B) in one day = 1/10 + 1/15 = (3+2)/30 = 5/30 = 1/6\\n4. Therefore, A and B together will complete the work in 6 days.",
      quickTricks: "For two people, use (Product of days) / (Sum of days). For more, find individual one-day work and sum them up, then take reciprocal."
    },
    {
      topic: "Blood Relations (Logical Reasoning)",
      introduction: "Blood Relations questions test your understanding of family relationships. You need to deduce the relationship between two members based on given information. It\\\"'s like solving a family puzzle!",
      formulaExplanation: "No specific formulas, but understanding common relations is key: Father\\\"'s father = Paternal Grandfather, Mother\\\"'s brother = Maternal Uncle, Son\\\"'s wife = Daughter-in-law, etc. Drawing a family tree diagram helps immensely.",
      solvedExample: "Problem: Pointing to a photograph, a man said, \\\"'I have no brother or sister, but that man\\\"'s father is my father\\\"'s son.\\\"' Whose photograph was it?\\n\\nSolution:\\n1. \\\"'My father\\\"'s son\\\"' - Since the man has no brother or sister, his father\\\"'s son is himself.\\n2. So, the statement becomes: \\\"'That man\\\"'s father is myself.\\\"'\\n3. Therefore, the man in the photograph is the speaker\\\"'s son.\\n\\nAnswer: His son\\\"'s photograph.",
      quickTricks: "1. Break down the statement into smaller parts. 2. Start from the end of the statement and work backward. 3. Draw a family tree if the relationships are complex."
    }
  ];
  return concepts[Math.floor(Math.random() * concepts.length)];
};

const getRandomCommunicationTip = () => {
  const tips = [
    {
      topic: "Active Listening",
      advice: "Active listening is about fully concentrating on what is being said rather than just passively hearing the message. It involves paying attention to both verbal and non-verbal cues, asking clarifying questions, and summarizing to confirm understanding.",
      importance: "Improves understanding, builds trust, reduces misunderstandings, and makes the speaker feel valued. Essential for effective teamwork and client interactions."
    },
    {
      topic: "Clear and Concise Writing",
      advice: "In professional communication, especially in emails or documentation, aim for clarity and conciseness. Get straight to the point, use simple language, avoid jargon where possible, and structure your thoughts logically with headings and bullet points.",
      importance: "Saves time for both the writer and reader, reduces ambiguity, ensures your message is understood quickly, and projects professionalism. Crucial for technical documentation and project updates."
    }
  ];
  return tips[Math.floor(Math.random() * tips.length)];
};

const getRandomMotivationalQuote = () => {
  const quotes = [
    {
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      reflection: "Passion fuels innovation. When you genuinely enjoy your craft, challenges become opportunities, and dedication comes naturally, leading to exceptional outcomes in your development journey."
    },
    {
      quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      reflection: "In the world of tech, setbacks are inevitable. This quote reminds us that resilience and persistence are paramount. Every bug fixed, every failed deployment analyzed, is a step forward, not a definitive end."
    }
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

// --- Comprehensive newsletter prompt ---
const createEnhancedNewsletterPrompt = (techNews) => `
You are a senior software engineer creating a weekly newsletter. Generate detailed, educational content. Your response MUST be a single, valid JSON object with no extra text.\n\nUse this latest tech news for context: ${JSON.stringify(techNews.slice(0, 2))}\n\nThe JSON structure:\n{\n  \"techNews\": { \"title\": \"🚀 This Week in Tech\", \"stories\": [ { \"headline\": \"Create a headline based on the news\", \"summary\": \"Explain its significance\", \"techImpact\": \"How it affects developers\", \"futureImplications\": \"What it means for the future\" } ] },\n  \"dsaChallenge\": { \"title\": \"💡 DSA Problem Solving\", \"leetCodeInfo\": \"Specify the LeetCode problem number and difficulty (e.g., \\\"LeetCode #1, Easy\\\")\", \"problemStatement\": \"Present a classic DSA problem with clear problem statement, input/output format, and constraints\", \"intuition\": \"Explain the core intuition in depth. Walk through the \\\"Aha!\\\" moment. Why does the optimal approach work? What are the trade-offs?\", \"stepByStepApproach\": \"Provide a very detailed, numbered, step-by-step breakdown of the algorithm\\\"'s logic. Explain each decision.\", \"codeExample\": \"Provide a clean, well-commented Java solution with time and space complexity\" },\n  \"dbmsConcept\": { \"title\": \"🗄️ Database Management Deep Dive\", \"topic\": \"Choose a DBMS concept (Normalization, ACID Properties, Indexing, Transactions, etc.)\", \"explanation\": \"Explain the concept in detail, covering its different forms or components.\", \"sqlQuestion\": \"Provide one SQL question related to the concept with a beginner-friendly explanation.\", \"sqlSolution\": \"Provide the SQL solution for the question.\", \"benefits\": \"Why is this concept important? What problems does it solve?\" },\n  \"osExplained\": { \"title\": \"🖥️ Operating Systems Deep Dive\", \"concept\": \"Choose an OS concept\", \"realWorldAnalogy\": \"An intuitive analogy\", \"technicalExplanation\": \"A technical breakdown\", \"whyItMatters\": \"Its real-world importance\" },\n  \"cnFundamentals\": { \"title\": \"🌐 Computer Networks Explained\", \"concept\": \"Pick a networking concept (TCP vs UDP, HTTP/HTTPS, DNS, Load Balancing, etc.)\", \"everydayExample\": \"Relate it to something everyone experiences\", \"technicalDetails\": \"Explain the technical workings in detail, mentioning relevant headers, ports, or handshake processes where applicable.\", \"practicalImportance\": \"Why should developers care about this?\" },\n  \"oopsConcepts\": { \"title\": \"🎯 Object-Oriented Programming\", \"principle\": \"Focus on one OOP principle (Encapsulation, Inheritance, Polymorphism, Abstraction)\", \"realLifeAnalogy\": \"Use a real-life analogy\", \"codeExample\": \"Provide a practical, well-commented code example that clearly demonstrates the concept in action and its benefits. in Java\", \"bestPractices\": \"Share 2-3 best practices for applying this concept\" },\n  \"aptitudeCorner\": { \"title\": \"🧮 Aptitude Corner\", \"topic\": \"Choose a quantitative, logical, or verbal aptitude topic\", \"introduction\": \"Introduce the topic with a relatable example\", \"formulaExplanation\": \"Explain the key formulas and when to use them (if applicable)\", \"solvedExample\": \"Provide a detailed step-by-step solved example, explaining the \\\"why\\\" behind each step of the calculation.\", \"quickTricks\": \"Share time-saving tricks or shortcuts (if applicable)\" },\n  \"communicationTips\": { \"title\": \"🗣️ Communication Tips for Developers\", \"topic\": \"Choose a communication topic (e.g., Active Listening, Clear Writing, Presentation Skills)\", \"advice\": \"Provide actionable advice and best practices.\", \"importance\": \"Explain why this communication skill is crucial for developers.\" },\n  \"motivationalQuote\": { \"title\": \"✨ Weekly Motivation\", \"quote\": \"An inspiring quote about technology, learning, or personal growth\", \"author\": \"The author of the quote\", \"reflection\": \"A 2-3 sentence reflection on how this quote applies to a developer\\\"'s journey\" }\n}\n\nMake each section substantial, practical, and fresh for today\\\"'s developers. Ensure no redundancy between daily content. Every time the content should be fresh and on point.\n`;

// --- Generate newsletter content ---
async function generateNewsletterContent() {
  try {
    console.log("📰 Fetching latest tech news...");
    const techNews = await fetchLatestTechNews();
    
    console.log("🤖 Generating comprehensive newsletter content...");
    const prompt = createEnhancedNewsletterPrompt(techNews);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENROUTER_API_KEY}` },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 2227, // FIXED: Lowered to stay within free credit limits
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      console.error("API Error:", await response.text());
      return getEnhancedDefaultContent();
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;

    try {
      const content = JSON.parse(rawContent.replace(/,(?=\\\\s*?[}\]])/g, ""));
      
      if (content.techNews) {
        content.techNews.realNews = techNews;
      } else {
        console.warn("⚠️ AI response was missing \\\"techNews\\\" section. Creating fallback.");
        content.techNews = {
          title: "🚀 This Week in Tech",
          stories: [],
          realNews: techNews
        };
      }
      return content;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return getEnhancedDefaultContent();
    }
  } catch (error) {
    console.error("Content generation error:", error);
    return getEnhancedDefaultContent();
  }
}

// --- Default content generator ---
function getEnhancedDefaultContent() {
  return {
    techNews: { title: "🚀 This Week in Tech", stories: [{ headline: "AI-Powered Tools Reshape Software Engineering", summary: "AI tools are changing how developers write code, boosting productivity.", techImpact: "Focus is shifting to architecture over syntax.", futureImplications: "The developer role will emphasize creativity and AI collaboration." }], realNews: [] },
    dsaChallenge: getRandomDSAProblem(),
    dbmsConcept: getRandomDBMSConcept(),
    osExplained: getRandomOSConcept(),
    cnFundamentals: getRandomCNConcept(),
    oopsConcepts: getRandomOOPsConcept(),
    aptitudeCorner: getRandomAptitudeConcept(),
    communicationTips: getRandomCommunicationTip(),
    motivationalQuote: getRandomMotivationalQuote()
  };
}

// --- Modern email template creator ---
function createModernEmailTemplate(content) {
  // A helper to safely access nested properties
  const get = (path, obj) => path.split(".").reduce((acc, part) => acc && acc[part], obj);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TechMaster Weekly</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f4f7f9; }
    .email-container { max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1a202c, #4a5568); color: white; padding: 40px; text-align: center; }\n    .header h1 { margin: 0 0 10px; font-size: 36px; }\n    .header p { margin: 0; color: #cbd5e0; }\n    .content-section { padding: 30px; border-bottom: 1px solid #e2e8f0; }\n    .section-header { display: flex; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #667eea; }\n    .section-icon { font-size: 28px; margin-right: 15px; }\n    .section-title { font-size: 24px; font-weight: 700; color: #2d3748; margin: 0; }\n    .card { background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 15px; border-left: 4px solid #667eea; }\n    .card h3 { margin: 0 0 10px; font-size: 18px; color: #4a5568; }\n    .card p { margin: 0; color: #4a5568; }\n    .code-block { background: #1a202c; color: #e2e8f0; border-radius: 8px; padding: 15px; margin-top: 15px; overflow-x: auto; font-family: 'SF Mono', Monaco, monospace; font-size: 14px; }\n    .footer { text-align: center; padding: 30px; color: #718096; font-size: 14px; }\n    .footer a { color: #667eea; text-decoration: none; }\n    .section-divider { border-top: 1px dashed #cbd5e0; margin: 40px 0; }\n    .call-to-action { background-color: #667eea; color: white; padding: 15px 25px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 20px; font-weight: bold; }\n    .call-to-action:hover { background-color: #5a67d8; }\n  </style>\n</head>\n<body>\n  <div class="email-container">\n    <div class="header">\n      <h1>🚀 TechMaster Weekly</h1>\n      <p>Your Guide to Modern Software Development | ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>\n    </div>\n\n    <div class="content-section">\n      <div class="section-header"><span class="section-icon">📰</span><h2 class="section-title">${get("techNews.title", content) || "Tech News"}</h2></div>\n      ${(get("techNews.stories", content) || []).map(news => `<div class="card"><h3>${news.headline || "No Headline"}</h3><p><strong>Summary:</strong> ${news.summary || "No summary available."}</p><p><strong>Tech Impact:</strong> ${news.techImpact || "No tech impact specified."}</p><p><strong>Future Implications:</strong> ${news.futureImplications || "No future implications specified."}</p></div>`).join("")}\n      ${(get("techNews.realNews", content) || []).map(news => `<div class="card"><h3>${news.title || "No Title"}</h3><p><strong>Source:</strong> ${news.source || "Unknown Source"}</p><p>${news.description || "No description available."}</p><p><a href="${news.url || "#"}">Read More</a></p></div>`).join("")}\n    </div>\n    <div class="section-divider"></div>\n
    <div class="content-section">\n      <div class="section-header"><span class="section-icon">💡</span><h2 class="section-title">${get("dsaChallenge.title", content) || "DSA Problem Solving"}</h2></div>\n      <div class="card">\n        <h3>Problem: ${get("dsaChallenge.leetCodeInfo", content) || "No LeetCode Info"}</h3>\n        <p>${marked(get("dsaChallenge.problemStatement", content) || "No problem statement available.")}</p>\n        <h4>Intuition:</h4>\n        <p>${marked(get("dsaChallenge.intuition", content) || "No intuition available.")}</p>\n        <h4>Step-by-Step Approach:</h4>\n        <p>${marked(get("dsaChallenge.stepByStepApproach", content) || "No step-by-step approach available.")}</p>\n        <h4>Solution:</h4>\n        <pre class="code-block"><code>${get("dsaChallenge.codeExample", content) || "No code example available."}</code></pre>\n      </div>\n    </div>\n    <div class="section-divider"></div>\n
    <div class="content-section">\n      <div class="section-header"><span class="section-icon">🗄️</span><h2 class="section-title">${get("dbmsConcept.title", content) || "Database Management Deep Dive"}</h2></div>\n      <div class="card">\n        <h3>Concept: ${get("dbmsConcept.topic", content) || "No Topic"}</h3>\n        <p>${marked(get("dbmsConcept.explanation", content) || "No explanation available.")}</p>\n        <h4>SQL Question:</h4>\n        <p>${marked(get("dbmsConcept.sqlQuestion", content) || "No SQL question available.")}</p>\n        <h4>SQL Solution:</h4>\n        <pre class="code-block"><code>${get("dbmsConcept.sqlSolution", content) || "No SQL solution available."}</code></pre>\n        <p><strong>Benefits:</strong> ${marked(get("dbmsConcept.benefits", content) || "No benefits specified.")}</p>\n      </div>\n    </div>\n    <div class="section-divider"></div>\n
    <div class="content-section">\n      <div class="section-header"><span class="section-icon">🖥️</span><h2 class="section-title">${get("osExplained.title", content) || "Operating Systems Deep Dive"}</h2></div>\n      <div class="card">\n        <h3>Concept: ${get("osExplained.concept", content) || "No Concept"}</h3>\n        <p><strong>Analogy:</strong> ${marked(get("osExplained.realWorldAnalogy", content) || "No analogy available.")}</p>\n        <p><strong>Technical Side:</strong> ${marked(get("osExplained.technicalExplanation", content) || "No technical explanation available.")}</p>\n        <p><strong>Why It Matters:</strong> ${marked(get("osExplained.whyItMatters", content) || "No importance specified.")}</p>\n      </div>\n    </div>\n    <div class="section-divider"></div>\n
    <div class="content-section">\n      <div class="section-header"><span class="section-icon">🌐</span><h2 class="section-title">${get("cnFundamentals.title", content) || "Computer Networks Explained"}</h2></div>\n      <div class="card">\n        <h3>Concept: ${get("cnFundamentals.concept", content) || "No Concept"}</h3>\n        <p><strong>Everyday Example:</strong> ${marked(get("cnFundamentals.everydayExample", content) || "No example available.")}</p>\n        <p><strong>Technical Details:</strong> ${marked(get("cnFundamentals.technicalDetails", content) || "No technical details available.")}</p>\n        <p><strong>Practical Importance:</strong> ${marked(get("cnFundamentals.practicalImportance", content) || "No practical importance specified.")}</p>\n      </div>\n    </div>\n    <div class="section-divider"></div>\n
    <div class="content-section">\n      <div class="section-header"><span class="section-icon">🎯</span><h2 class="section-title">${get("oopsConcepts.title", content) || "Object-Oriented Programming"}</h2></div>\n      <div class="card">\n        <h3>Principle: ${get("oopsConcepts.principle", content) || "No Principle"}</h3>\n        <p><strong>Real-Life Analogy:</strong> ${marked(get("oopsConcepts.realLifeAnalogy", content) || "No analogy available.")}</p>\n        <h4>Code Example:</h4>\n        <pre class="code-block"><code>${get("oopsConcepts.codeExample", content) || "No code example available."}</code></pre>\n        <p><strong>Best Practices:</strong> ${marked(get("oopsConcepts.bestPractices", content) || "No best practices specified.")}</p>\n      </div>\n    </div>\n    <div class="section-divider"></div>\n
    <div class="content-section">\n      <div class="section-header"><span class="section-icon">🧮</span><h2 class="section-title">${get("aptitudeCorner.title", content) || "Aptitude Corner"}</h2></div>\n      <div class="card">\n        <h3>Topic: ${get("aptitudeCorner.topic", content) || "No Topic"}</h3>\n        <p><strong>Introduction:</strong> ${marked(get("aptitudeCorner.introduction", content) || "No introduction available.")}</p>\n        <p><strong>Formula Explanation:</strong> ${marked(get("aptitudeCorner.formulaExplanation", content) || "No formula explanation available.")}</p>\n        <h4>Solved Example:</h4>\n        <pre class="code-block"><code>${marked(get("aptitudeCorner.solvedExample", content) || "No solved example available.")}</code></pre>\n        <p><strong>Quick Tricks:</strong> ${marked(get("aptitudeCorner.quickTricks", content) || "No quick tricks available.")}</p>\n      </div>\n    </div>\n    <div class="section-divider"></div>\n
    <div class="content-section">\n      <div class="section-header"><span class="section-icon">🗣️</span><h2 class="section-title">${get("communicationTips.title", content) || "Communication Tips for Developers"}</h2></div>\n      <div class="card">\n        <h3>Topic: ${get("communicationTips.topic", content) || "No Topic"}</h3>\n        <p><strong>Advice:</strong> ${marked(get("communicationTips.advice", content) || "No advice available.")}</p>\n        <p><strong>Importance:</strong> ${marked(get("communicationTips.importance", content) || "No importance specified.")}</p>\n      </div>\n    </div>\n    <div class="section-divider"></div>\n
    <div class="content-section">\n      <div class="section-header"><span class="section-icon">✨</span><h2 class="section-title">${get("motivationalQuote.title", content) || "Weekly Motivation"}</h2></div>\n      <div class="card">\n        <blockquote>"${get("motivationalQuote.quote", content) || "No quote available."}"</blockquote>\n        <p><em>— ${get("motivationalQuote.author", content) || "Unknown Author"}</em></p>\n        <p><strong>Reflection:</strong> ${marked(get("motivationalQuote.reflection", content) || "No reflection available.")}</p>\n      </div>\n    </div>\n    <div class="section-divider"></div>\n
    <div class="footer">\n      <p>&copy; ${new Date().getFullYear()} TechMaster Weekly. All rights reserved.</p>\n      <p>Follow us on <a href="#">Twitter</a> | <a href="#">LinkedIn</a></p>\n    </div>\n  </div>\n</body>\n</html>\n`;
}

// --- Main function to send newsletter ---
async function sendNewsletter() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  });

  console.log("🚀 Generating comprehensive newsletter content...");
  const content = await generateNewsletterContent();

  if (!content) {
    console.log("❌ Failed to generate content. Using fallback content.");
    return;
  }
  console.log("✅ Content generated successfully. Preparing email...");

  const emailHtml = createModernEmailTemplate(content);

  try {
    const subscribers = await getSubscribers();
    console.log(`📧 Sending emails to ${subscribers.length} subscribers...`);

    for (const { email } of subscribers) {
      const mailOptions = {
        from: `"TechMaster Weekly" <${GMAIL_USER}>`,
        to: email,
        subject: `🚀 TechMaster Weekly - Your Latest Tech Insights`,
        html: emailHtml,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Newsletter sent to ${email}`);
    }
    console.log("🎉 All newsletters sent successfully!");
  } catch (error) {
    console.error("Error sending newsletter:", error);
  }
}

// --- MODIFIED: This function is changed to use Supabase ---
async function getSubscribers() {
  console.log("Fetching subscribers from Supabase...");
  const { data, error } = await supabase
    .from("subscribers") // Your table name
    .select("email");   // The column you want

  if (error) {
    console.error("Supabase fetch error:", error.message);
    throw error; // Propagate the error to be caught by the caller
  }
  
  return data;
}

// Call the main function to send the newsletter
sendNewsletter();

