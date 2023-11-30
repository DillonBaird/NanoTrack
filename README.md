# NanoTrack: Nano-Size Analytics

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Docker Pulls](https://img.shields.io/docker/pulls/nanotrack)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Introduction
NanoTrack redefines web analytics with its minimalistic yet powerful approach to user activity tracking. Designed for performance-conscious developers and marketers, it ensures efficient data collection without the need for heavy JavaScript libraries, aligning with modern standards of ethical web practices.

## 🌄 Background
NanoTrack was born out of a simple yet profound idea: to shed light on the extensive data exchanged with every interaction on the internet. My initial inspiration was to create a project that would inform users and the internet at large about the staggering amount of data they unknowingly release with every call to a server. It was an attempt to raise awareness about data privacy expectations online, regardless of how diligently we try to block trackers.

What started as an inspirational idea quickly evolved into something much more significant. In just a matter of three days, version 1.0 of NanoTrack went from a conceptual spark to a full-fledged self-hosting analytic tool. The realization of how valuable this tool could be for various use cases was a driving force behind its rapid development.

## 📖 Table of Contents
- [NanoTrack: Nano-Size Analytics](#nanotrack-nano-size-analytics)
  - [🌟 Introduction](#-introduction)
  - [🌄 Background](#-background)
  - [📖 Table of Contents](#-table-of-contents)
  - [🚀 Getting Started](#-getting-started)
    - [Self-Hosting](#self-hosting)
    - [Cloud Providers](#cloud-providers)
      - [DigitalOcean](#digitalocean)
      - [Google Cloud Run](#google-cloud-run)
      - [Amazon ECS](#amazon-ecs)
      - [Kamatera](#kamatera)
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

