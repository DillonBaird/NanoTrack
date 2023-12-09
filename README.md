# 📊 NanoTrack: 1x1 Nano-Size Spy-Pixel Analytics

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Docker Pulls](https://img.shields.io/docker/pulls/nanotrack)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Introduction
NanoTrack redefines web analytics with its minimalistic yet powerful approach to user activity tracking. Designed for performance-conscious developers and marketers, it ensures efficient data collection without the need for heavy JavaScript libraries, aligning with modern standards of ethical web practices.

## 🌄 Background
NanoTrack was born out of a simple yet profound idea: to shed light on the extensive data exchanged with every interaction on the internet. My initial inspiration was to create a project that would inform users and the internet at large about the staggering amount of data they unknowingly release with every call to a server. It was an attempt to raise awareness about data privacy expectations online, regardless of how diligently we try to block trackers.

What started as an inspirational idea quickly evolved into something much more significant. In just a matter of three days, version 1.0 of NanoTrack went from a conceptual spark to a full-fledged self-hosting analytic tool. The realization of how valuable this tool could be for various use cases was a driving force behind its rapid development.

## ⚠️ Limitations of Pixel Tracking

While NanoTrack provides a streamlined and efficient approach to web analytics, it's important for users to understand the inherent limitations of pixel tracking technology. This understanding will help in determining the best use cases for NanoTrack and how it complements other analytics tools.

### Caching Challenges
- **Impact on Repeat Tracking:** Caching mechanisms in browsers and networks can impact the ability to track repeat visits accurately. When a tracking pixel is cached, subsequent requests may not reach the server, leading to undercounting of user interactions.
- **NanoTrack's Mitigation Efforts:** Although NanoTrack implements strategies to minimize caching effects (such as cache-busting techniques), it's crucial to acknowledge that these methods can't completely eliminate the impact of caching on analytics.

### Comparison with Standard Analytics
- **Not a Full Replacement:** Given the limitations posed by caching and the nature of pixel tracking, NanoTrack is not a 1-to-1 replacement for standard, JavaScript-heavy analytics solutions. 
- **Solid Alternative with Right Implementation:** However, with the right implementation and understanding of its limitations, NanoTrack can serve as a solid alternative or complement to traditional analytics tools, especially in scenarios where lightweight and unobtrusive tracking is desired.

### Ideal Use Cases
- **Email Open Tracking:** Perfect for environments where embedding JavaScript is not feasible, such as tracking email opens.
- **Basic Pageview Tracking:** Well-suited for simple pageview tracking, where detailed user interactions are not the primary focus.
- **Complement to Standard Analytics:** Can be used alongside more comprehensive analytics solutions to provide additional insights without adding significant load to your web pages.

Understanding these limitations is key to leveraging NanoTrack effectively. It’s designed to offer a balance between performance and tracking capabilities, catering to specific scenarios where a lightweight and ethical approach to analytics is preferred.

## 🚧 Early-Release Beta Status

### Current Phase
NanoTrack is currently in an **early-release beta** phase. This is an exciting stage in the project's lifecycle where users have the unique opportunity to shape its development. During this phase, I am actively refining features, squashing bugs, and enhancing the overall functionality of the tool.

### Expect Continuous Improvements
- **Ongoing Enhancements:** Users can expect a continuous rollout of improvements and new features. My development roadmap is packed with exciting updates that I am eager to share.
- **Active Development:** The beta phase is characterized by active development. This means regular updates and changes as I iterate based on user feedback and my own innovation.

### Your Feedback Matters
- **Community Input:** I highly value user feedback during this phase. Your experiences, suggestions, and criticisms are crucial in steering NanoTrack towards a tool that truly meets the needs of its users.
- **Join the Development Journey:** By using NanoTrack now, you're not just adopting a tool; you're joining a journey of development and innovation. I encourage users to report any issues they encounter and share their thoughts on potential features.

### A Note of Caution
- **Expect Some Instability:** As with any beta software, users should be prepared for some instability and imperfections. I recommend not relying on NanoTrack as the sole analytics tool for mission-critical applications during this beta phase.

I'm excited to have you aboard during this pivotal phase of NanoTrack's development and look forward to growing together!

## 📖 Table of Contents
- [📊 NanoTrack: 1x1 Nano-Size Spy-Pixel Analytics](#-nanotrack-1x1-nano-size-spy-pixel-analytics)
  - [🌟 Introduction](#-introduction)
  - [🌄 Background](#-background)
  - [⚠️ Limitations of Pixel Tracking](#️-limitations-of-pixel-tracking)
    - [Caching Challenges](#caching-challenges)
    - [Comparison with Standard Analytics](#comparison-with-standard-analytics)
    - [Ideal Use Cases](#ideal-use-cases)
  - [🚧 Early-Release Beta Status](#-early-release-beta-status)
    - [Current Phase](#current-phase)
    - [Expect Continuous Improvements](#expect-continuous-improvements)
    - [Your Feedback Matters](#your-feedback-matters)
    - [A Note of Caution](#a-note-of-caution)
  - [📖 Table of Contents](#-table-of-contents)
  - [🚀 Getting Started](#-getting-started)
    - [Self-Hosting](#self-hosting)
    - [Cloud Providers](#cloud-providers)
      - [DigitalOcean](#digitalocean)
      - [Google Cloud Run](#google-cloud-run)
      - [Amazon ECS](#amazon-ecs)
      - [Kamatera](#kamatera)
  - [🌟 Usage Examples](#-usage-examples)
    - [Web Tracking](#web-tracking)
    - [Email Tracking](#email-tracking)
    - [Event Tracking](#event-tracking)
    - [Advanced Parameter Tracking](#advanced-parameter-tracking)
  - [🌐 NPM Library for Easy Integration](#-npm-library-for-easy-integration)
    - [🛠️ Quick Integration](#️-quick-integration)
      - [For React:](#for-react)
      - [For Vue:](#for-vue)
    - [More Frameworks:](#more-frameworks)
  - [🌟 Core Features](#-core-features)
  - [🎯 Use Cases](#-use-cases)
  - [📦 Installation](#-installation)
    - [Docker Setup (Recommended)](#docker-setup-recommended)
    - [Alternative Installation](#alternative-installation)
  - [🕹 Data Collected](#-data-collected)
  - [⚙️ Configuration Options](#️-configuration-options)
    - [📝 Environment Configuration](#-environment-configuration)
    - [🛠️ Setting Up the `.env` File](#️-setting-up-the-env-file)
  - [📄 Responsible and Ethical Use](#-responsible-and-ethical-use)
  - [🔒 Enhancing Security with HTTPS](#-enhancing-security-with-https)
    - [Why Use HTTPS?](#why-use-https)
    - [Setting Up HTTPS with Cloudflare](#setting-up-https-with-cloudflare)
      - [Steps to Implement:](#steps-to-implement)
  - [🤝 Contributing to NanoTrack](#-contributing-to-nanotrack)
  - [👥 Community and Contributors](#-community-and-contributors)
  - [📄 License](#-license)
  - [📞 Contact](#-contact)
  - [📸 Screenshots](#-screenshots)
  - [🛣 Roadmap](#-roadmap)
  - [📜 Changelog](#-changelog)
  - [🛠 Troubleshooting](#-troubleshooting)

## 🚀 Getting Started
### Self-Hosting
If you prefer self-hosting, follow these steps:

1. Clone this repository to your server.
2. Deploy NanoTrack using Docker:
```bash
docker pull nanotrack/nanotrack
docker run [options] nanotrack/nanotrack
```
3. Embed the tracking pixel: `http://[your_server_ip]/track/action.gif?campaignID=your-campaign-id`

### Cloud Providers
Choose your preferred cloud provider to quickly deploy NanoTrack:

#### DigitalOcean
1. Create a new Droplet using the Docker image for NanoTrack.
2. SSH into your Droplet and run the following commands:
```bash
docker pull nanotrack/nanotrack
docker run [options] nanotrack/nanotrack
```
3. Embed the tracking pixel: `http://[Droplet_IP]/track/action.gif?campaignID=your-campaign-id`

#### Google Cloud Run
1. Create a new Cloud Run service using the NanoTrack Docker image from Docker Hub.
2. Deploy the service and expose it to the internet.
3. Access your NanoTrack instance using the provided URL.

#### Amazon ECS
1. Create a new Amazon ECS cluster and task definition using the NanoTrack Docker image.
2. Launch the task on your cluster.
3. Configure the service to expose it to the internet.
4. Access your NanoTrack instance using the provided URL.

#### Kamatera
1. Create a new instance using the NanoTrack Docker image.
2. Configure networking to expose the instance to the internet.
3. Access your NanoTrack instance using the provided IP.

## 🌟 Usage Examples
NanoTrack allows for the tracking of various user interactions by embedding customizable tracking URLs. You can track standard metrics like page views or email opens, and also include unlimited additional parameters in the URL query to capture specific user actions or preferences.

### Web Tracking
Track user interactions on specific web pages by embedding a tracking URL. For example, to track a pageview on `dillonbaird.io` (the specific page is parsed from the referrer automatically), use the following URL:

> http://**[your_server_ip]**/track/**pageview**.gif?campaignID=**dillonbaird.io**

### Email Tracking
Track email opens by embedding a tracking URL in the email. For instance, to track an email open for an `offer letter` sent to `dillon@dillonbaird.io`, use:

> http://**[your_server_ip]**/track/**email-open:dillon@dillonbaird.io**.gif?campaignID=**email-offerletter**

### Event Tracking
Monitor specific user actions or events on your application. For instance, to track `user registrations`, you can embed a URL like this:

> http://**[your_server_ip]**/track/**user-registration**.gif?campaignID=**my-awesome-app**

This example would track whenever a user accesses the registration page, helping you understand user interest in signing up for your service.

### Advanced Parameter Tracking
NanoTrack also supports tracking of additional custom parameters. You can append any number of custom parameters to your tracking URL to gather more detailed insights. For instance, to track how far users scroll on a blog post and whether they use dark mode, you might use:

> http://**[your_server_ip]**/track/**pageview**.gif?campaignID=**dillonbaird.io**&**scroll-depth=70%**&**dark-mode=true**

This method allows for a highly detailed understanding of user behavior and preferences, making your analytics more robust and actionable.

## 🌐 NPM Library for Easy Integration
If for some unknown reason embeding an <img src="..." /> tag is too vanilla/native for you, I've developed an NPM library for seamless embedding of NanoTrack in frameworks like React, Vue, and more. With these packages, embedding a tracking pixel is as easy as adding a component. (Feels silly doesn't it? But hey, who am I to judge?)

### 🛠️ Quick Integration
#### For React:
```javascript
import { NanoTracker } from 'nanotrack-react';

<NanoTracker campaignID="your-campaign-id" />
```

#### For Vue:
```javascript
<template>
  <nano-tracker campaign-id="your-campaign-id"></nano-tracker>
</template>

<script>
import NanoTracker from 'nanotrack-vue';

export default {
  components: {
    NanoTracker
  }
}
</script>
```

### More Frameworks:
Continuously expanding to support a wide range of frameworks.

## 🌟 Core Features
- **Effortless Data Collection**: Tracks essential metrics with a simple pixel.
- **Real-Time Dashboard**: View user interactions instantly.
- **Storage Flexibility**: MongoDB for scalability, flat files for simplicity.
- **Lightweight and Non-Intrusive**: No heavy JavaScript.

## 🎯 Use Cases
- **Email Campaign Tracking**: Measure open rates and engagement.
- **Website Visitor Analytics**: Gain insights without impacting load times.
- **Marketing Campaign Monitoring**: Unique IDs for tailored tracking.

## 📦 Installation
### Docker Setup (Recommended)
Easy setup with Docker:
```bash
docker pull nanotrack/nanotrack
docker run [options] nanotrack/nanotrack
```
### Alternative Installation
For manual setups: Requires Node.js, npm, and MongoDB.

## 🕹 Data Collected
- **User Agent**: Browser and device information.
- **IP Address**: Geolocation data.
- **Page Path and Timestamps**: User journey.
- **Referrer Data**: Traffic sources.
- **Custom Campaign IDs**: For specific tracking.

## ⚙️ Configuration Options
NanoTrack offers a range of configurable options to suit your specific tracking requirements and preferences. You can set these options in an `.env` file or as environment variables.

### 📝 Environment Configuration
Here are some of the key configuration options available:

1. **Storage System Type**
   - `DB_TYPE`: Choose the type of storage system (`mongodb` or `flatfile`) for data persistence.
     ```env
     DB_TYPE=mongodb
     ```

2. **Dashboard Authentication**
   - `DASHBOARD_USER`: Set a username for dashboard access.
   - `DASHBOARD_PASSWORD`: Set a password for dashboard access.
     ```env
     DASHBOARD_USER=admin
     DASHBOARD_PASSWORD=securepassword
     ```

3. **Custom Tracking Image**
   - `TRACKING_IMAGE_URL`: Optionally return a custom image instead of a transparent pixel. This can be used for transparency in tracking.
     ```env
     TRACKING_IMAGE_URL=http://example.com/your-image.png
     ```

4. **Disabling Specific Tracking Information**
   - `DISABLE_IP_TRACKING`: Disable collecting IP addresses.
   - `DISABLE_USER_AGENT_TRACKING`: Disable collecting user agent data.
     ```env
     DISABLE_IP_TRACKING=true
     DISABLE_USER_AGENT_TRACKING=false
     ```

5. **Other Configurations**
   - Additional options can be added here as your project evolves.

### 🛠️ Setting Up the `.env` File
Create a `.env` file in your project root and set your desired configuration options:
```env
DB_TYPE=mongodb
DASHBOARD_USER=admin
DASHBOARD_PASSWORD=securepassword
TRACKING_IMAGE_URL=http://example.com/your-image.png
DISABLE_IP_TRACKING=true
DISABLE_USER_AGENT_TRACKING=false
```

These settings give you the flexibility to customize NanoTrack's functionality and privacy settings according to your preferences and requirements.

## 📄 Responsible and Ethical Use
By using NanoTrack, you commit to:

- **Adherence to Laws:** Complying with all relevant data privacy laws in your region.
- **Respect User Privacy:** Honoring user privacy and data removal requests.
- **Ethical Usage:** Using NanoTrack responsibly and not for malicious activities.

## 🔒 Enhancing Security with HTTPS

In today's digital landscape, securing your tracking data is paramount. We highly recommend using HTTPS to encrypt the data transmitted between your users and NanoTrack. This not only protects user privacy but also strengthens the integrity of the data collected.

### Why Use HTTPS?
- **Data Security:** Prevents unauthorized interception of tracking data.
- **User Trust:** Increases trust in your service, as users are becoming more security-conscious.
- **SEO Benefits:** Search engines, like Google, favor HTTPS-enabled websites, potentially improving your site's ranking.

### Setting Up HTTPS with Cloudflare
One of the simplest ways to implement HTTPS is by using Cloudflare. Cloudflare provides a free and easy-to-setup SSL/TLS certificate, ensuring that your tracking data is securely transmitted over the internet.

#### Steps to Implement:
1. **Register with Cloudflare:** Sign up for a free account on Cloudflare.
2. **Configure DNS Settings:** Point your domain's DNS records to Cloudflare.
3. **Enable SSL/TLS:** In your Cloudflare dashboard, navigate to the SSL/TLS section and enable the 'Full' or 'Strict' SSL/TLS encryption mode.
4. **Update NanoTrack URLs:** Ensure that all NanoTrack URLs in your project are updated to `https`.

By following these steps, you can significantly enhance the security of your NanoTrack implementation with minimal effort.

## 🤝 Contributing to NanoTrack
I welcome contributions that enhance NanoTrack's efficiency and ethics. See [Contribution Guidelines](CONTRIBUTING.md).

## 👥 Community and Contributors
Join our community! Check our [Contributors' Gallery](CONTRIBUTORS.md) and [Discord Channel](#).

## 📄 License
NanoTrack is under the [MIT License](LICENSE.md).

## 📞 Contact
For support or inquiries, reach us at [Your Email/Contact Information].

## 📸 Screenshots
![NanoTrack Dashboard](/path/to/dashboard_screenshot.png)

## 🛣 Roadmap
- [Feature 1]
- [Improvement 2]
- More on our [Roadmap](ROADMAP.md).

## 📜 Changelog
Stay updated with our [Changelog](CHANGELOG.md).

## 🛠 Troubleshooting
Common issues and their solutions in our [Troubleshooting Guide](TROUBLESHOOTING.md).

