/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.16-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: pos_db
-- ------------------------------------------------------
-- Server version	10.11.16-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auditlog`
--

DROP TABLE IF EXISTS `auditlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditlog` (
  `id` varchar(191) NOT NULL,
  `businessId` varchar(191) DEFAULT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `entity` varchar(191) NOT NULL,
  `entityId` varchar(191) DEFAULT NULL,
  `metadata` varchar(191) DEFAULT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `userAgent` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `AuditLog_businessId_createdAt_idx` (`businessId`,`createdAt`),
  KEY `AuditLog_action_idx` (`action`),
  KEY `AuditLog_userId_fkey` (`userId`),
  CONSTRAINT `AuditLog_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditlog`
--

LOCK TABLES `auditlog` WRITE;
/*!40000 ALTER TABLE `auditlog` DISABLE KEYS */;
INSERT INTO `auditlog` VALUES
('10e5d9b3-7d56-4ecd-9738-576a4e202902','8378e480-a786-4700-a328-900ec83a3a77','c52b60aa-1170-42f3-97a4-9110aa124c79','DEMO_LOGIN_SUCCESS','User','c52b60aa-1170-42f3-97a4-9110aa124c79','{\"role\":\"BUSINESS_OWNER\",\"loginId\":\"OWN-FASHION\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0','2026-10-30 07:20:36.528'),
('110dce67-cd7b-478c-a196-2ab0f5626bb3','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','7f7ad8f0-52ed-4f08-abc6-60c0c7193c9d','DEMO_LOGIN_SUCCESS','User','7f7ad8f0-52ed-4f08-abc6-60c0c7193c9d','{\"role\":\"BUSINESS_OWNER\",\"loginId\":\"OWN-TECH\"}','::1','node','2026-10-30 06:59:48.118'),
('1223e4aa-b5ec-49ff-902f-f35400e94a00','8378e480-a786-4700-a328-900ec83a3a77','0a4a23ef-0e95-4975-9fa4-79bd67b0c351','DEMO_LOGIN_SUCCESS','User','0a4a23ef-0e95-4975-9fa4-79bd67b0c351','{\"role\":\"CASHIER\",\"loginId\":\"EMP-FASHION\"}','::1','node','2026-10-30 06:59:48.056'),
('4217b324-a61a-47ff-b26c-93807b1cc6c3','6c52f25b-187b-48a1-a909-dbe5a961561c','626ae0c2-76e8-4bb5-9216-41cc27f88486','DEMO_LOGIN_SUCCESS','User','626ae0c2-76e8-4bb5-9216-41cc27f88486','{\"role\":\"CASHIER\",\"loginId\":\"EMP-PHARM\"}','::1','node','2026-10-30 06:59:47.979'),
('4bee3836-cffc-4e67-a517-c14fb84e39ff','c2b7949b-dd30-47cf-9d04-c2062240278f','44601d6e-d03f-4d20-9c3d-d1f58ade1192','DEMO_LOGIN_SUCCESS','User','44601d6e-d03f-4d20-9c3d-d1f58ade1192','{\"role\":\"CASHIER\",\"loginId\":\"EMP-CAFE\"}','::1','node','2026-10-30 06:59:47.780'),
('5ac64e25-1d45-42cc-9b6b-61752c0d0c43','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','46fd6a4c-77a7-46d5-9718-ee013cd9ab76','DEMO_LOGIN_SUCCESS','User','46fd6a4c-77a7-46d5-9718-ee013cd9ab76','{\"role\":\"CASHIER\",\"loginId\":\"EMP-TECH\"}','::1','node','2026-10-30 06:59:48.160'),
('5afefff9-b8f5-4320-98ce-41c81af54c15','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','dd7d8c9b-0f2a-4409-b70c-52f4f67e8f39','DEMO_LOGIN_SUCCESS','User','dd7d8c9b-0f2a-4409-b70c-52f4f67e8f39','{\"role\":\"BUSINESS_OWNER\",\"loginId\":\"OWN-GROCERY\"}','::1','node','2026-10-30 06:59:47.625'),
('5bd32d4f-d240-4a08-8bbb-55535b849f3c','ef520599-7256-4dc1-98b5-ba69ecc3e080','b29b5280-8565-4b4a-95d0-27069354a452','DEMO_LOGIN_SUCCESS','User','b29b5280-8565-4b4a-95d0-27069354a452','{\"role\":\"CASHIER\",\"loginId\":\"EMP-SALON\"}','::1','node','2026-10-30 06:59:48.360'),
('635beec7-e835-4857-892e-2ea49af7f46c',NULL,'e0a387f8-59f0-4374-ad6f-87b8bc067979','DEMO_LOGIN_SUCCESS','User','e0a387f8-59f0-4374-ad6f-87b8bc067979','{\"role\":\"SUPER_ADMIN\",\"loginId\":\"ADMIN-0001\"}','::1','node','2026-10-30 06:59:47.555'),
('6e213435-294c-4f1a-ac2e-136f734e78ce','6c52f25b-187b-48a1-a909-dbe5a961561c','dbcb1254-7d48-44d1-8758-5c980e73d58b','DEMO_LOGIN_SUCCESS','User','dbcb1254-7d48-44d1-8758-5c980e73d58b','{\"role\":\"BUSINESS_OWNER\",\"loginId\":\"OWN-PHARM\"}','::1','node','2026-10-30 06:59:47.923'),
('72bc7bbf-547a-40ab-baff-fc765f881e8c','c2b7949b-dd30-47cf-9d04-c2062240278f','44601d6e-d03f-4d20-9c3d-d1f58ade1192','DEMO_LOGIN_SUCCESS','User','44601d6e-d03f-4d20-9c3d-d1f58ade1192','{\"role\":\"CASHIER\",\"loginId\":\"EMP-CAFE\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0','2026-10-30 07:07:21.794'),
('72dbc6ce-4261-47f5-8715-6de70b3c0155','8378e480-a786-4700-a328-900ec83a3a77','c52b60aa-1170-42f3-97a4-9110aa124c79','DEMO_LOGIN_SUCCESS','User','c52b60aa-1170-42f3-97a4-9110aa124c79','{\"role\":\"BUSINESS_OWNER\",\"loginId\":\"OWN-FASHION\"}','::1','node','2026-10-30 06:59:48.025'),
('7e23108f-e9ab-4839-a929-c7ad88eb40e6','ef520599-7256-4dc1-98b5-ba69ecc3e080','caed1bc4-0837-4af1-af5d-a947ec18c7f2','DEMO_LOGIN_SUCCESS','User','caed1bc4-0837-4af1-af5d-a947ec18c7f2','{\"role\":\"BUSINESS_OWNER\",\"loginId\":\"OWN-SALON\"}','::1','node','2026-10-30 06:59:48.303'),
('92364f7e-69b7-457b-841e-2cbeacca43f4','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','e4fbf10a-1012-43a8-aa3d-207e7fbc253c','DEMO_LOGIN_SUCCESS','User','e4fbf10a-1012-43a8-aa3d-207e7fbc253c','{\"role\":\"CASHIER\",\"loginId\":\"EMP-GROCERY\"}','::1','node','2026-10-30 06:59:47.671'),
('92ce1315-5d66-4a08-8221-23a968567f80','8297bbf8-4101-473d-a2e5-267f06286bef','1011adbd-9744-4941-b3c1-b5125340af27','DEMO_LOGIN_SUCCESS','User','1011adbd-9744-4941-b3c1-b5125340af27','{\"role\":\"CASHIER\",\"loginId\":\"EMP-BAKERY\"}','::1','node','2026-10-30 06:59:47.887'),
('9eb80dbe-03ea-4dd6-9fc9-ae6d23abeb44','505ffc4c-398e-471a-8547-80e5016e1c23','da7a7e9f-1666-4717-944e-ac4490530e9f','DEMO_LOGIN_SUCCESS','User','da7a7e9f-1666-4717-944e-ac4490530e9f','{\"role\":\"CASHIER\",\"loginId\":\"EMP-WHOLESALE\"}','::1','node','2026-10-30 06:59:48.265'),
('a1459be5-5ab6-44f6-bff1-5fd007092ec6','c2b7949b-dd30-47cf-9d04-c2062240278f','5e7b51e7-04c9-432b-b27f-7d16581f9b3e','DEMO_LOGIN_SUCCESS','User','5e7b51e7-04c9-432b-b27f-7d16581f9b3e','{\"role\":\"BUSINESS_OWNER\",\"loginId\":\"OWN-CAFE\"}','::1','node','2026-10-30 06:59:47.718'),
('a31bd78a-2cc4-4362-8fa5-980cbea6f8a9','8297bbf8-4101-473d-a2e5-267f06286bef','6a89745b-4119-4d23-84f7-fb8eb8ba1eee','DEMO_LOGIN_SUCCESS','User','6a89745b-4119-4d23-84f7-fb8eb8ba1eee','{\"role\":\"BUSINESS_OWNER\",\"loginId\":\"OWN-BAKERY\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0','2026-10-30 07:00:06.676'),
('aa0b7ff2-cbe8-479e-b1ff-13fc48d718f0','8297bbf8-4101-473d-a2e5-267f06286bef','1011adbd-9744-4941-b3c1-b5125340af27','DEMO_LOGIN_SUCCESS','User','1011adbd-9744-4941-b3c1-b5125340af27','{\"role\":\"CASHIER\",\"loginId\":\"EMP-BAKERY\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0','2026-10-30 07:18:53.857'),
('b822948b-470e-4e3c-b48f-b74d4f0c1081','8297bbf8-4101-473d-a2e5-267f06286bef','6a89745b-4119-4d23-84f7-fb8eb8ba1eee','DEMO_LOGIN_SUCCESS','User','6a89745b-4119-4d23-84f7-fb8eb8ba1eee','{\"role\":\"BUSINESS_OWNER\",\"loginId\":\"OWN-BAKERY\"}','::1','node','2026-10-30 06:59:47.836'),
('cf8515b6-bb28-4d07-bd6d-2c1ca612e91c','505ffc4c-398e-471a-8547-80e5016e1c23','439a6f99-ca21-4e61-8993-86624ab0a8f0','DEMO_LOGIN_SUCCESS','User','439a6f99-ca21-4e61-8993-86624ab0a8f0','{\"role\":\"BUSINESS_OWNER\",\"loginId\":\"OWN-WHOLESALE\"}','::1','node','2026-10-30 06:59:48.226');
/*!40000 ALTER TABLE `auditlog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branch`
--

DROP TABLE IF EXISTS `branch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `branch` (
  `id` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `isDefault` tinyint(1) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Branch_businessId_code_key` (`businessId`,`code`),
  KEY `Branch_businessId_idx` (`businessId`),
  CONSTRAINT `Branch_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branch`
--

LOCK TABLES `branch` WRITE;
/*!40000 ALTER TABLE `branch` DISABLE KEYS */;
INSERT INTO `branch` VALUES
('08bb65bd-ab90-4904-8719-d7bb65bbb9b2','8378e480-a786-4700-a328-900ec83a3a77','Kandy City Center Branch','BR-02','0812201002','Level 2, KCC, Kandy',0,1,'2026-10-30 06:59:18.465','2026-10-30 06:59:18.465'),
('109fa35f-7dea-468e-b9e7-585d82bcf865','8297bbf8-4101-473d-a2e5-267f06286bef','Nugegoda Super Outlet','BR-02','0112811002','88 Stanley Thilakaratne Mw, Nugegoda',0,1,'2026-10-30 06:59:18.294','2026-10-30 06:59:18.294'),
('14ade0d8-8baa-4836-86ed-7092860c45d6','505ffc4c-398e-471a-8547-80e5016e1c23','Pettah Wholesale Yard','BR-01','0112441001','88 Main Street, Pettah, Colombo 11',1,1,'2026-10-30 06:59:18.662','2026-10-30 06:59:18.662'),
('2d90e014-db88-462c-85cf-f40ecbb8da91','ef520599-7256-4dc1-98b5-ba69ecc3e080','Salon Main - Bambalapitiya','BR-01','0112581001','180 Galle Road, Bambalapitiya',1,1,'2026-10-30 06:59:18.732','2026-10-30 06:59:18.732'),
('61e91c8d-76c0-458a-9f1a-bd754ecd0994','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','Kandy City Branch','BR-02','0812231002','45 Dalada Veediya, Kandy',0,1,'2026-10-30 06:59:18.089','2026-10-30 06:59:18.089'),
('679a151e-ff46-423c-ba34-236c3f189be4','6c52f25b-187b-48a1-a909-dbe5a961561c','Dispensary - Maharagama','BR-01','0112841001','310 High Level Road, Maharagama',1,1,'2026-10-30 06:59:18.383','2026-10-30 06:59:18.383'),
('6aa0d05b-fbbf-4ba4-bb51-55da9741af09','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','Main Tech Store - Liberty Plaza','BR-01','0112571001','Shop 14, Liberty Plaza, Colombo 03',1,1,'2026-10-30 06:59:18.567','2026-10-30 06:59:18.567'),
('76e5709f-7435-4965-8686-8d4a80bc981e','6c52f25b-187b-48a1-a909-dbe5a961561c','Negombo Town Branch','BR-02','0312221002','15 Main Street, Negombo',0,1,'2026-10-30 06:59:18.385','2026-10-30 06:59:18.385'),
('c528369c-e28b-489a-8ab3-4ae3879aca13','c2b7949b-dd30-47cf-9d04-c2062240278f','Central Kitchen - Colombo 04','BR-01','0112551001','74 Duplication Road, Colombo 04',1,1,'2026-10-30 06:59:18.209','2026-10-30 06:59:18.209'),
('c92c3704-a2ce-45fe-ad6e-c8143d6bad6c','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','Main Supermarket - Colombo 03','BR-01','0112341001','128 Galle Road, Colombo 03',1,1,'2026-10-30 06:59:18.085','2026-10-30 06:59:18.085'),
('c94c4980-2a88-4d29-a2b5-fbb37261a476','ef520599-7256-4dc1-98b5-ba69ecc3e080','Rajagiriya Spa Branch','BR-02','0112861002','44 Parliament Road, Rajagiriya',0,1,'2026-10-30 06:59:18.734','2026-10-30 06:59:18.734'),
('d63d3c8c-e540-4240-8d43-d793bb0ed546','8297bbf8-4101-473d-a2e5-267f06286bef','Main Bakery - Dehiwala','BR-01','0112711001','210 Hill Street, Dehiwala',1,1,'2026-10-30 06:59:18.293','2026-10-30 06:59:18.293'),
('d783ea71-c3d3-43b9-86ea-735966c89f30','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','Majestic City Branch','BR-02','0112591002','Shop 42, 3rd Floor, MC, Colombo 04',0,1,'2026-10-30 06:59:18.569','2026-10-30 06:59:18.569'),
('e38291df-5572-409b-bc05-de9834f89fa7','505ffc4c-398e-471a-8547-80e5016e1c23','Wattala Storage Depot','BR-02','0112931002','200 Negombo Road, Wattala',0,1,'2026-10-30 06:59:18.665','2026-10-30 06:59:18.665'),
('e7b87d8d-ee09-4f96-b903-84d312338868','c2b7949b-dd30-47cf-9d04-c2062240278f','Galle Beach Cafe','BR-02','0912221002','12 Light House St, Galle Fort',0,1,'2026-10-30 06:59:18.214','2026-10-30 06:59:18.214'),
('f5d826ee-dae5-4a3b-9bab-daf528a2f852','8378e480-a786-4700-a328-900ec83a3a77','Flagship Boutique - Colombo 07','BR-01','0112691001','52 Ward Place, Colombo 07',1,1,'2026-10-30 06:59:18.463','2026-10-30 06:59:18.463');
/*!40000 ALTER TABLE `branch` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business`
--

DROP TABLE IF EXISTS `business`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `business` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `businessType` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `city` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'TRIAL',
  `currency` varchar(191) NOT NULL DEFAULT 'LKR',
  `timezone` varchar(191) NOT NULL DEFAULT 'Asia/Colombo',
  `taxNumber` varchar(191) DEFAULT NULL,
  `defaultTaxRate` double NOT NULL DEFAULT 0,
  `receiptHeader` varchar(191) DEFAULT NULL,
  `receiptFooter` varchar(191) DEFAULT 'Thank you for your business! Come again.',
  `onboardingStep` int(11) NOT NULL DEFAULT 1,
  `isOnboarded` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Business_code_key` (`code`),
  KEY `Business_code_idx` (`code`),
  KEY `Business_phone_idx` (`phone`),
  KEY `Business_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business`
--

LOCK TABLES `business` WRITE;
/*!40000 ALTER TABLE `business` DISABLE KEYS */;
INSERT INTO `business` VALUES
('505ffc4c-398e-471a-8547-80e5016e1c23','Lanka Wholesale Hardware','T2G-WHOLESALE','Wholesale','0771000007','owner@lankawholesale.lk','88 Main Street, Pettah','Colombo','ACTIVE','LKR','Asia/Colombo',NULL,0,'Lanka Wholesale Hardware\n88 Main Street, Pettah\nTel: 0771000007','Thank you for shopping with us! Please come again.',4,1,'2026-10-30 06:59:18.651','2026-10-30 06:59:18.651'),
('6c52f25b-187b-48a1-a909-dbe5a961561c','MediCare Wellness Pharmacy','T2G-PHARM','Pharmacy','0771000004','owner@medicarepharm.lk','310 High Level Road, Maharagama','Maharagama','ACTIVE','LKR','Asia/Colombo',NULL,0,'MediCare Wellness Pharmacy\n310 High Level Road, Maharagama\nTel: 0771000004','Thank you for shopping with us! Please come again.',4,1,'2026-10-30 06:59:18.378','2026-10-30 06:59:18.378'),
('8297bbf8-4101-473d-a2e5-267f06286bef','Perera Bake House','T2G-BAKERY','Bakery & Takeaway','0771000003','owner@pererabakery.lk','210 Hill Street, Dehiwala','Dehiwala','ACTIVE','LKR','Asia/Colombo',NULL,0,'Perera Bake House\n210 Hill Street, Dehiwala\nTel: 0771000003','Thank you for shopping with us! Please come again.',4,1,'2026-10-30 06:59:18.289','2026-10-30 06:59:18.289'),
('8378e480-a786-4700-a328-900ec83a3a77','City Style Boutique','T2G-FASHION','Clothing Store','0771000005','owner@citystyle.lk','52 Ward Place, Colombo 07','Colombo','ACTIVE','LKR','Asia/Colombo',NULL,0,'City Style Boutique\n52 Ward Place, Colombo 07\nTel: 0771000005','Thank you for shopping with us! Please come again.',4,1,'2026-10-30 06:59:18.459','2026-10-30 06:59:18.459'),
('c2b7949b-dd30-47cf-9d04-c2062240278f','Kottu & Cafe House','T2G-CAFE','Restaurant & Cafe','0771000002','owner@kottucafe.lk','74 Duplication Road, Colombo 04','Colombo','ACTIVE','LKR','Asia/Colombo',NULL,0,'Kottu & Cafe House\n74 Duplication Road, Colombo 04\nTel: 0771000002','Thank you for shopping with us! Please come again.',4,1,'2026-10-30 06:59:18.199','2026-10-30 06:59:18.199'),
('ca781118-44a9-4de8-b4b8-5f500f9c2f1b','iTech Mobile & Gadgets','T2G-TECH','Electronics & Mobile','0771000006','owner@itechmobile.lk','Shop 14, Liberty Plaza, Colombo 03','Colombo','ACTIVE','LKR','Asia/Colombo',NULL,0,'iTech Mobile & Gadgets\nShop 14, Liberty Plaza, Colombo 03\nTel: 0771000006','Thank you for shopping with us! Please come again.',4,1,'2026-10-30 06:59:18.564','2026-10-30 06:59:18.564'),
('eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','Lanka Fresh Supermarket','T2G-GROCERY','Grocery & Retail','0771000001','owner@lankafresh.lk','128 Galle Road, Colombo 03','Colombo','ACTIVE','LKR','Asia/Colombo',NULL,0,'Lanka Fresh Supermarket\n128 Galle Road, Colombo 03\nTel: 0771000001','Thank you for shopping with us! Please come again.',4,1,'2026-10-30 06:59:18.074','2026-10-30 06:59:18.074'),
('ef520599-7256-4dc1-98b5-ba69ecc3e080','Crown & Blade Luxury Salon','T2G-SALON','Salon & Barber','0771000008','owner@crownblade.lk','180 Galle Road, Bambalapitiya','Colombo','ACTIVE','LKR','Asia/Colombo',NULL,0,'Crown & Blade Luxury Salon\n180 Galle Road, Bambalapitiya\nTel: 0771000008','Thank you for shopping with us! Please come again.',4,1,'2026-10-30 06:59:18.729','2026-10-30 06:59:18.729');
/*!40000 ALTER TABLE `business` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `color` varchar(191) DEFAULT '#0f766e',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Category_businessId_name_key` (`businessId`,`name`),
  KEY `Category_businessId_idx` (`businessId`),
  CONSTRAINT `Category_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES
('015d2fcb-7748-44d6-8d54-a98b9433e206','8378e480-a786-4700-a328-900ec83a3a77','Women\'s Wear & Dresses',NULL,'#ec4899',1,'2026-10-30 06:59:18.511','2026-10-30 06:59:18.511'),
('05b4bcb6-7bc8-4e3d-9a18-347a502436ed','ef520599-7256-4dc1-98b5-ba69ecc3e080','Facials & Skin Care',NULL,'#10b981',1,'2026-10-30 06:59:18.754','2026-10-30 06:59:18.754'),
('153b89cc-ad75-4623-96a9-83e7030cd0ae','c2b7949b-dd30-47cf-9d04-c2062240278f','Kottu & Roti',NULL,'#ef4444',1,'2026-10-30 06:59:18.232','2026-10-30 06:59:18.232'),
('1b587022-928b-48a5-855c-ed95751a1f18','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','Screen Protectors & Glass',NULL,'#f43f5e',1,'2026-10-30 06:59:18.588','2026-10-30 06:59:18.588'),
('22492cc4-2105-4114-a84d-2a78b947d919','c2b7949b-dd30-47cf-9d04-c2062240278f','Fried Rice & Noodles',NULL,'#f97316',1,'2026-10-30 06:59:18.234','2026-10-30 06:59:18.234'),
('4462f64f-97d0-4924-9ef5-2cdbab2648f6','6c52f25b-187b-48a1-a909-dbe5a961561c','First Aid & Surgical',NULL,'#06b6d4',1,'2026-10-30 06:59:18.409','2026-10-30 06:59:18.409'),
('4c2275ef-3780-43a2-8e75-817e1f731fe2','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','Rice, Dhal & Grains',NULL,'#10b981',1,'2026-10-30 06:59:18.120','2026-10-30 06:59:18.120'),
('4ee65dd6-7eb3-4f51-afbf-eff0458b8532','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','Beverages & Milk',NULL,'#0284c7',1,'2026-10-30 06:59:18.113','2026-10-30 06:59:18.113'),
('5982d682-702d-4bf8-b712-d3a907387116','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','Personal Care & Soap',NULL,'#8b5cf6',1,'2026-10-30 06:59:18.122','2026-10-30 06:59:18.122'),
('5f4990ed-45f3-49b0-bfff-b809172a2524','8378e480-a786-4700-a328-900ec83a3a77','Bags & Belts',NULL,'#78716c',1,'2026-10-30 06:59:18.514','2026-10-30 06:59:18.514'),
('656756db-92a0-4374-8a9b-bb7125fa9664','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','Power Banks',NULL,'#eab308',1,'2026-10-30 06:59:18.591','2026-10-30 06:59:18.591'),
('6feee49b-d3bf-4076-be95-ed0a090a86b4','505ffc4c-398e-471a-8547-80e5016e1c23','Plumbing & PVC',NULL,'#0ea5e9',1,'2026-10-30 06:59:18.684','2026-10-30 06:59:18.684'),
('70043056-30d0-4d17-88c2-ba091f32e8fc','8297bbf8-4101-473d-a2e5-267f06286bef','Hot Pastries',NULL,'#f97316',1,'2026-10-30 06:59:18.309','2026-10-30 06:59:18.309'),
('833d0471-ed5c-456a-893a-ee0a262abdfd','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','Smartphones',NULL,'#6366f1',1,'2026-10-30 06:59:18.585','2026-10-30 06:59:18.585'),
('942d71bb-5721-41fb-a89a-417eafa47e02','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','Chargers & Cables',NULL,'#14b8a6',1,'2026-10-30 06:59:18.586','2026-10-30 06:59:18.586'),
('b236c493-5591-471d-8168-b00ae85ee6e3','6c52f25b-187b-48a1-a909-dbe5a961561c','Prescription Drugs (Rx)',NULL,'#ef4444',1,'2026-10-30 06:59:18.405','2026-10-30 06:59:18.405'),
('bc10b60e-adde-4890-bd6e-e5c51d296655','505ffc4c-398e-471a-8547-80e5016e1c23','Electrical & Lighting',NULL,'#eab308',1,'2026-10-30 06:59:18.686','2026-10-30 06:59:18.686'),
('bc3d22e6-60ae-4184-bf69-25e5e001aa8f','8297bbf8-4101-473d-a2e5-267f06286bef','Short Eats & Buns',NULL,'#eab308',1,'2026-10-30 06:59:18.307','2026-10-30 06:59:18.307'),
('be62da0b-57a1-4b05-8913-69a3ab72953b','6c52f25b-187b-48a1-a909-dbe5a961561c','OTC & Pain Relief',NULL,'#10b981',1,'2026-10-30 06:59:18.403','2026-10-30 06:59:18.403'),
('c0bfd90e-53c1-4844-9d96-b24a2683b90b','c2b7949b-dd30-47cf-9d04-c2062240278f','Hot Beverages (Tea/Coffee)',NULL,'#84cc16',1,'2026-10-30 06:59:18.237','2026-10-30 06:59:18.237'),
('c14584b5-f7e7-4538-b2fd-90ca373662c3','505ffc4c-398e-471a-8547-80e5016e1c23','Building Materials & Cement',NULL,'#64748b',1,'2026-10-30 06:59:18.683','2026-10-30 06:59:18.683'),
('ca9ed794-427a-4fd2-bc2a-b3d7f437367e','8378e480-a786-4700-a328-900ec83a3a77','Traditional & Sarees',NULL,'#e11d48',1,'2026-10-30 06:59:18.516','2026-10-30 06:59:18.516'),
('d37fa0b0-081a-43b1-bde9-a25147e7afdd','c2b7949b-dd30-47cf-9d04-c2062240278f','Fresh Juices & Shakes',NULL,'#06b6d4',1,'2026-10-30 06:59:18.236','2026-10-30 06:59:18.236'),
('d3d7553f-1b11-4556-940e-3ee32bb13f89','8297bbf8-4101-473d-a2e5-267f06286bef','Bread & Loaves',NULL,'#a855f7',1,'2026-10-30 06:59:18.312','2026-10-30 06:59:18.312'),
('d90d83b7-7166-44a1-aadb-3fda1d0ed478','8378e480-a786-4700-a328-900ec83a3a77','Men\'s Casual & Formal',NULL,'#3b82f6',1,'2026-10-30 06:59:18.485','2026-10-30 06:59:18.485'),
('ddb4520d-741f-4c0e-8f28-b825335c9995','ef520599-7256-4dc1-98b5-ba69ecc3e080','Retail Shampoos & Oils',NULL,'#8b5cf6',1,'2026-10-30 06:59:18.755','2026-10-30 06:59:18.755'),
('e715d77d-1b4a-4610-8106-3639a4fe3f06','ef520599-7256-4dc1-98b5-ba69ecc3e080','Hair Styling & Cuts',NULL,'#ec4899',1,'2026-10-30 06:59:18.752','2026-10-30 06:59:18.752'),
('e86b2a42-3169-41e0-89fc-c05c9f5a8a51','8297bbf8-4101-473d-a2e5-267f06286bef','Cakes & Slices',NULL,'#ec4899',1,'2026-10-30 06:59:18.310','2026-10-30 06:59:18.310'),
('ef52a1de-96ca-4316-8d83-dcca0eef4dab','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','Biscuits & Snacks',NULL,'#f59e0b',1,'2026-10-30 06:59:18.117','2026-10-30 06:59:18.117'),
('f23e43f3-f6ed-4a66-b548-fd7fe2dde3ab','505ffc4c-398e-471a-8547-80e5016e1c23','Fasteners & Hardware',NULL,'#d97706',1,'2026-10-30 06:59:18.688','2026-10-30 06:59:18.688'),
('fa8ce256-2bfe-4664-80d5-a7a44e5b1db0','6c52f25b-187b-48a1-a909-dbe5a961561c','Vitamins & Supplements',NULL,'#f59e0b',1,'2026-10-30 06:59:18.407','2026-10-30 06:59:18.407');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `id` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `branchId` varchar(191) DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `totalSpent` double NOT NULL DEFAULT 0,
  `purchaseCount` int(11) NOT NULL DEFAULT 0,
  `creditBalance` double NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Customer_businessId_phone_key` (`businessId`,`phone`),
  KEY `Customer_businessId_name_idx` (`businessId`,`name`),
  KEY `Customer_branchId_idx` (`branchId`),
  CONSTRAINT `Customer_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Customer_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES
('34dc43ee-e8a0-4c1e-9fef-c6597081a2ac','8297bbf8-4101-473d-a2e5-267f06286bef','d63d3c8c-e540-4240-8d43-d793bb0ed546','Anoma Jayawardena','0777123453',NULL,'Mount Lavinia',NULL,400,1,0,'2026-10-30 06:59:18.315','2026-10-30 06:59:18.376'),
('6ae5e2cd-87f3-461d-b4d3-fa5c610695c9','c2b7949b-dd30-47cf-9d04-c2062240278f','c528369c-e28b-489a-8ab3-4ae3879aca13','Thilina Alwis','0777123452',NULL,'Bambalapitiya, Colombo',NULL,4550,1,0,'2026-10-30 06:59:18.241','2026-10-30 06:59:18.286'),
('796a0dc0-c104-4b28-8536-ba3d762a18fe','ef520599-7256-4dc1-98b5-ba69ecc3e080','2d90e014-db88-462c-85cf-f40ecbb8da91','Nadeeka Dharmadasa','0777123458',NULL,'Colombo 03',NULL,9500,1,0,'2026-10-30 06:59:18.759','2026-10-30 06:59:18.803'),
('7ca8105d-5928-4243-86b1-e1a28cbdbc01','8378e480-a786-4700-a328-900ec83a3a77','f5d826ee-dae5-4a3b-9bab-daf528a2f852','Ishani Wickrama','0777123455',NULL,'Havelock Town, Colombo',NULL,12200,1,0,'2026-10-30 06:59:18.520','2026-10-30 06:59:18.562'),
('8cb4e959-1923-4a4f-9c22-f9b9a3c3962a','505ffc4c-398e-471a-8547-80e5016e1c23','14ade0d8-8baa-4836-86ed-7092860c45d6','Kandy Engineering & Constructions','0777123457',NULL,'Peradeniya Road, Kandy',NULL,12100,1,0,'2026-10-30 06:59:18.692','2026-10-30 06:59:18.727'),
('9a69fa51-82b1-4647-9137-3109ba1063b8','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','c92c3704-a2ce-45fe-ad6e-c8143d6bad6c','Kamal Perera','0777123451',NULL,'Kollupitiya, Colombo',NULL,920,1,0,'2026-10-30 06:59:18.127','2026-10-30 06:59:18.195'),
('b2d1ff7f-5df5-4273-9dd0-00a52e7a97db','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','6aa0d05b-fbbf-4ba4-bb51-55da9741af09','Buddhika Weerakkody','0777123456',NULL,'Wellawatte, Colombo',NULL,694500,1,0,'2026-10-30 06:59:18.594','2026-10-30 06:59:18.649'),
('eb16324f-1959-4c2f-8558-9a189e36fcac','6c52f25b-187b-48a1-a909-dbe5a961561c','679a151e-ff46-423c-ba34-236c3f189be4','Dr. Priyantha Kularatne','0777123454',NULL,'Nawala, Rajagiriya',NULL,710,1,0,'2026-10-30 06:59:18.412','2026-10-30 06:59:18.457');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense`
--

DROP TABLE IF EXISTS `expense`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense` (
  `id` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `branchId` varchar(191) DEFAULT NULL,
  `category` varchar(191) NOT NULL,
  `amount` double NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `expenseDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `recordedById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `Expense_businessId_expenseDate_idx` (`businessId`,`expenseDate`),
  KEY `Expense_branchId_expenseDate_idx` (`branchId`,`expenseDate`),
  KEY `Expense_recordedById_fkey` (`recordedById`),
  CONSTRAINT `Expense_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Expense_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Expense_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense`
--

LOCK TABLES `expense` WRITE;
/*!40000 ALTER TABLE `expense` DISABLE KEYS */;
INSERT INTO `expense` VALUES
('08978f2d-48a4-4054-b7ee-5064fd4b4eae','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','c92c3704-a2ce-45fe-ad6e-c8143d6bad6c','Shop Rent',85000,'Monthly retail space rental','2026-10-30 06:59:18.179','dd7d8c9b-0f2a-4409-b70c-52f4f67e8f39','2026-10-30 06:59:18.180'),
('097881b3-7ef9-4cd5-a2e8-eaa905f5abba','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','6aa0d05b-fbbf-4ba4-bb51-55da9741af09','Shop Rent',95000,'Liberty Plaza monthly mall shop rent','2026-10-30 06:59:18.639','7f7ad8f0-52ed-4f08-abc6-60c0c7193c9d','2026-10-30 06:59:18.640'),
('15b34f60-cdc1-41de-b720-33731a8c234e','c2b7949b-dd30-47cf-9d04-c2062240278f','c528369c-e28b-489a-8ab3-4ae3879aca13','Restaurant Rent',110000,'Monthly restaurant lease','2026-10-30 06:59:18.281','5e7b51e7-04c9-432b-b27f-7d16581f9b3e','2026-10-30 06:59:18.282'),
('451bd3d4-1ef9-41c1-8434-9daf7cfd1ae2','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','c92c3704-a2ce-45fe-ad6e-c8143d6bad6c','Electricity / Commercial Refrigeration',42000,'Chiller and store electricity','2026-10-30 06:59:18.182','dd7d8c9b-0f2a-4409-b70c-52f4f67e8f39','2026-10-30 06:59:18.184'),
('4a7bb3fa-e3cb-406f-b663-b09eb6d8bc3d','505ffc4c-398e-471a-8547-80e5016e1c23','14ade0d8-8baa-4836-86ed-7092860c45d6','Lorry Transport & Freight',45000,'Heavy bulk transport and fuel','2026-10-30 06:59:18.721','439a6f99-ca21-4e61-8993-86624ab0a8f0','2026-10-30 06:59:18.723'),
('745266a6-5233-4d20-9b58-f87636339917','ef520599-7256-4dc1-98b5-ba69ecc3e080','2d90e014-db88-462c-85cf-f40ecbb8da91','Salon Premises Rent',90000,'Monthly salon studio rent','2026-10-30 06:59:18.795','caed1bc4-0837-4af1-af5d-a947ec18c7f2','2026-10-30 06:59:18.796'),
('8138d152-d8e5-4d3c-b60a-8eb37ac10619','8297bbf8-4101-473d-a2e5-267f06286bef','d63d3c8c-e540-4240-8d43-d793bb0ed546','Bakery Shop Rent',65000,'Monthly outlet rental','2026-10-30 06:59:18.369','6a89745b-4119-4d23-84f7-fb8eb8ba1eee','2026-10-30 06:59:18.371'),
('85a089e9-d7cc-46d2-b93e-71b6cf09006a','8378e480-a786-4700-a328-900ec83a3a77','f5d826ee-dae5-4a3b-9bab-daf528a2f852','Boutique Showroom Rent',125000,'Prime Colombo 07 retail showroom lease','2026-10-30 06:59:18.554','c52b60aa-1170-42f3-97a4-9110aa124c79','2026-10-30 06:59:18.556'),
('9e5825db-904a-40fb-980d-370dbcb3b707','6c52f25b-187b-48a1-a909-dbe5a961561c','679a151e-ff46-423c-ba34-236c3f189be4','Electricity / Air Conditioning & Cold Chain',38000,'24/7 Cold storage and dispensary AC','2026-10-30 06:59:18.448','dbcb1254-7d48-44d1-8758-5c980e73d58b','2026-10-30 06:59:18.450'),
('b4ae266a-1748-4ee4-8792-3fc2eddff99a','8378e480-a786-4700-a328-900ec83a3a77','f5d826ee-dae5-4a3b-9bab-daf528a2f852','Electricity / Accent Lighting & AC',32000,'Showroom spot lighting and climate control','2026-10-30 06:59:18.556','c52b60aa-1170-42f3-97a4-9110aa124c79','2026-10-30 06:59:18.558'),
('d27696e9-e624-479e-9e04-6d47e18afd79','c2b7949b-dd30-47cf-9d04-c2062240278f','c528369c-e28b-489a-8ab3-4ae3879aca13','LP Gas & Firewood',35000,'Kitchen commercial gas cylinders','2026-10-30 06:59:18.279','5e7b51e7-04c9-432b-b27f-7d16581f9b3e','2026-10-30 06:59:18.281'),
('da504516-1946-412d-b0eb-a90608978c22','8297bbf8-4101-473d-a2e5-267f06286bef','d63d3c8c-e540-4240-8d43-d793bb0ed546','Flour, Butter, Sugar & Baking Ingredients',48000,'Weekly bulk baking raw ingredients','2026-10-30 06:59:18.366','6a89745b-4119-4d23-84f7-fb8eb8ba1eee','2026-10-30 06:59:18.368'),
('daa9bc3d-3ea6-4c4c-af6c-561d0e2c11e2','505ffc4c-398e-471a-8547-80e5016e1c23','14ade0d8-8baa-4836-86ed-7092860c45d6','Warehouse & Yard Rent',150000,'Monthly Pettah wholesale commercial yard rent','2026-10-30 06:59:18.719','439a6f99-ca21-4e61-8993-86624ab0a8f0','2026-10-30 06:59:18.721'),
('e18c9199-4e7f-44f5-af25-cc7f5c2a1694','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','6aa0d05b-fbbf-4ba4-bb51-55da9741af09','Courier & Shipping Costs',15000,'Islandwide delivery via Prompt Xpress','2026-10-30 06:59:18.641','7f7ad8f0-52ed-4f08-abc6-60c0c7193c9d','2026-10-30 06:59:18.643'),
('e319b4c8-9af8-469e-8ef8-40b760041d2c','6c52f25b-187b-48a1-a909-dbe5a961561c','679a151e-ff46-423c-ba34-236c3f189be4','Pharmacy Rent',80000,'Monthly commercial building rental','2026-10-30 06:59:18.450','dbcb1254-7d48-44d1-8758-5c980e73d58b','2026-10-30 06:59:18.452'),
('f5da3012-2fd0-4fd5-8496-0d05dfd94755','ef520599-7256-4dc1-98b5-ba69ecc3e080','2d90e014-db88-462c-85cf-f40ecbb8da91','Electricity / Air Conditioning & Blow Dryers',28000,'Saloon electricity bill','2026-10-30 06:59:18.797','caed1bc4-0837-4af1-af5d-a947ec18c7f2','2026-10-30 06:59:18.799');
/*!40000 ALTER TABLE `expense` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `id` varchar(191) NOT NULL,
  `branchId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `quantity` double NOT NULL DEFAULT 0,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Inventory_branchId_productId_key` (`branchId`,`productId`),
  KEY `Inventory_branchId_idx` (`branchId`),
  KEY `Inventory_productId_idx` (`productId`),
  CONSTRAINT `Inventory_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Inventory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES
('069a183c-a1bc-4fb6-a048-a13ee7fadecc','d63d3c8c-e540-4240-8d43-d793bb0ed546','f3b0ab3d-08e3-4d6b-8222-5af37ddbdca3',60,'2026-10-30 06:59:18.348'),
('0f8a0759-f270-4bd0-9c59-4cd47b5f9aed','c92c3704-a2ce-45fe-ad6e-c8143d6bad6c','3522189e-924f-476d-853c-da70c1307b2c',150,'2026-10-30 06:59:18.152'),
('0ffb2d9c-3aa3-4f22-bafc-364a793849ab','f5d826ee-dae5-4a3b-9bab-daf528a2f852','608ca4c7-712c-4d17-8cc8-7d3bb97edabc',40,'2026-10-30 06:59:18.525'),
('1051ae8d-53d8-4f0b-b0de-a71fda1972cd','109fa35f-7dea-468e-b9e7-585d82bcf865','b2438eaa-e3ac-4775-8204-527827f2d20e',70,'2026-10-30 06:59:18.321'),
('17856c0a-d6ca-4c03-8e30-0f8e33776d1f','76e5709f-7435-4965-8686-8d4a80bc981e','48143f0e-d0ed-45bf-8ab1-72a03a828499',20,'2026-10-30 06:59:18.448'),
('1fcf8fb8-df22-48d2-9d29-5bea328987b4','f5d826ee-dae5-4a3b-9bab-daf528a2f852','41fb78b0-354d-4b56-a193-c97e451ba133',30,'2026-10-30 06:59:18.532'),
('24b78f3b-7056-420c-acec-ada145a45f1b','679a151e-ff46-423c-ba34-236c3f189be4','d6785560-1efd-4a78-a229-feedaaa3e8bb',55,'2026-10-30 06:59:18.441'),
('271554d9-35a5-4362-af5b-2bd996a24870','d63d3c8c-e540-4240-8d43-d793bb0ed546','3bdd51d5-b75d-41a2-a35b-5b299719b8ae',45,'2026-10-30 06:59:18.330'),
('2b65216b-8189-4d07-ae1f-bad3f0d2080b','6aa0d05b-fbbf-4ba4-bb51-55da9741af09','c0bd7ce5-35ef-40b1-8047-dc4af41a84c1',60,'2026-10-30 06:59:18.604'),
('2be770a2-91bb-4dc1-a26d-1f739ee8f719','e7b87d8d-ee09-4f96-b903-84d312338868','1fc1cf8b-0f94-4862-a33e-d9e5d7010d64',45,'2026-10-30 06:59:18.252'),
('2f6b007f-3124-48b9-9986-da28706c623f','c94c4980-2a88-4d29-a2b5-fbb37261a476','6041a1f1-3630-46a4-9352-98405aa01116',0,'2026-10-30 06:59:18.784'),
('332b7e92-afac-410c-af6b-6d84a0304d2f','109fa35f-7dea-468e-b9e7-585d82bcf865','667823b2-a06b-4957-8aa2-1ad139bbaf67',60,'2026-10-30 06:59:18.338'),
('39b0c9d8-3e51-4ca2-b10c-23606bcae68d','d63d3c8c-e540-4240-8d43-d793bb0ed546','b2438eaa-e3ac-4775-8204-527827f2d20e',110,'2026-10-30 06:59:18.319'),
('3a4aa52c-db4c-4635-b15d-4a00f5c4248f','c92c3704-a2ce-45fe-ad6e-c8143d6bad6c','3d5f2c3a-284d-4568-a64c-f37a5703163e',45,'2026-10-30 06:59:18.143'),
('3e642ca9-a329-4138-8fd8-ecdb1a242ccc','e38291df-5572-409b-bc05-de9834f89fa7','422b0348-c860-4b39-8206-ab784b7864c3',40,'2026-10-30 06:59:18.713'),
('3e70776f-67bd-48dd-959e-63276c34d98e','2d90e014-db88-462c-85cf-f40ecbb8da91','6041a1f1-3630-46a4-9352-98405aa01116',0,'2026-10-30 06:59:18.782'),
('466ad5c1-8081-487a-a236-7b2249697e62','61e91c8d-76c0-458a-9f1a-bd754ecd0994','e1a51301-3c34-4697-bc17-d305d2a8e7cc',90,'2026-10-30 06:59:18.160'),
('466c657d-075a-4cee-9dfd-b92896132994','d63d3c8c-e540-4240-8d43-d793bb0ed546','eae899c0-bb7b-4543-8036-7685c2fba22b',85,'2026-10-30 06:59:18.325'),
('4689df5f-ac56-4882-adf0-571c21a9c39e','c92c3704-a2ce-45fe-ad6e-c8143d6bad6c','7c0ce770-8b83-46cb-ac1c-aa8924c14559',200,'2026-10-30 06:59:18.148'),
('476483c7-2066-4c11-a26b-02e7a5a185c7','76e5709f-7435-4965-8686-8d4a80bc981e','d6785560-1efd-4a78-a229-feedaaa3e8bb',30,'2026-10-30 06:59:18.442'),
('4ed46dbc-c5c4-45ee-9734-3e848782fa92','76e5709f-7435-4965-8686-8d4a80bc981e','3bb39b18-f1f3-40fe-b53a-84cb76ae6413',35,'2026-10-30 06:59:18.436'),
('551c66b6-0cfc-4748-9ba4-cc8c66422fee','61e91c8d-76c0-458a-9f1a-bd754ecd0994','7285731d-ecd7-4f15-90a5-0b4abd23f221',60,'2026-10-30 06:59:18.138'),
('66765b70-3928-49d3-8d29-5f9a5ba55b71','14ade0d8-8baa-4836-86ed-7092860c45d6','3f348e8e-c89e-4b25-a250-fcf0fcb2f1fd',50,'2026-10-30 06:59:18.706'),
('67f6e794-ba7f-420a-b350-857403151d05','6aa0d05b-fbbf-4ba4-bb51-55da9741af09','1cdbb658-d012-44ba-a47a-002e422ac3c5',35,'2026-10-30 06:59:18.618'),
('67fcb707-016a-4810-a749-212f5d2960e6','2d90e014-db88-462c-85cf-f40ecbb8da91','b8b179f3-3a99-4e06-866f-28c3da029ce3',40,'2026-10-30 06:59:18.787'),
('6bf8f5b5-5cea-4fd0-a72f-9dfa7cdfb854','76e5709f-7435-4965-8686-8d4a80bc981e','3438b856-6217-40f7-952f-e946c1355e57',120,'2026-10-30 06:59:18.419'),
('6fcf9d88-7433-4761-838c-77825a0603d7','c92c3704-a2ce-45fe-ad6e-c8143d6bad6c','dd5f0db1-994a-492c-98c6-c99e0ecb7dc8',85,'2026-10-30 06:59:18.165'),
('70c84ac0-1c06-4ac5-88d2-df3ca0761f68','14ade0d8-8baa-4836-86ed-7092860c45d6','87325e26-a95d-4fcc-bac7-fdc26dcd79d8',120,'2026-10-30 06:59:18.717'),
('71935722-54cb-4fb7-96ad-4e7591e415c8','d783ea71-c3d3-43b9-86ea-735966c89f30','db679747-0597-498a-a527-b315a069c46b',80,'2026-10-30 06:59:18.612'),
('71ac8a9f-33fc-468d-926b-c24e8b2b92fc','d783ea71-c3d3-43b9-86ea-735966c89f30','dbb4ce13-e642-48c0-83cd-514e2e059945',5,'2026-10-30 06:59:18.600'),
('724aa827-f5f3-4a04-8a3b-ae2425bf6366','d783ea71-c3d3-43b9-86ea-735966c89f30','c0bd7ce5-35ef-40b1-8047-dc4af41a84c1',35,'2026-10-30 06:59:18.606'),
('777ad026-2c3e-4341-8781-a675f39136e4','e7b87d8d-ee09-4f96-b903-84d312338868','4132420c-f8ad-462e-92a9-f4ce6ee034a4',100,'2026-10-30 06:59:18.274'),
('7c8c0ec8-a2fd-41b9-942b-86148e003af0','e38291df-5572-409b-bc05-de9834f89fa7','f3aa0bd5-0056-47d0-b3e1-c43c77bd1426',50,'2026-10-30 06:59:18.702'),
('7ce9cd31-2b66-43ce-a5a2-9d9cb9a3f44a','08bb65bd-ab90-4904-8719-d7bb65bbb9b2','608ca4c7-712c-4d17-8cc8-7d3bb97edabc',25,'2026-10-30 06:59:18.527'),
('7e8a99f7-d41c-4e76-8620-e37ea958163c','c528369c-e28b-489a-8ab3-4ae3879aca13','8725c93c-8e06-44a2-841a-66155dd293d8',75,'2026-10-30 06:59:18.261'),
('809feb4d-7814-499a-920e-259bd65f544b','61e91c8d-76c0-458a-9f1a-bd754ecd0994','7c0ce770-8b83-46cb-ac1c-aa8924c14559',100,'2026-10-30 06:59:18.149'),
('84a2e872-2b64-4ac1-a7cf-1145eca244aa','e38291df-5572-409b-bc05-de9834f89fa7','f95d8d5e-a691-4568-a3d4-d411ed55a6d3',250,'2026-10-30 06:59:18.697'),
('89edf7ea-60ed-43fc-b7f8-9af17f5bd7bc','679a151e-ff46-423c-ba34-236c3f189be4','3438b856-6217-40f7-952f-e946c1355e57',250,'2026-10-30 06:59:18.417'),
('8b60f436-149f-4740-9893-6bbfc775e09e','e38291df-5572-409b-bc05-de9834f89fa7','3f348e8e-c89e-4b25-a250-fcf0fcb2f1fd',30,'2026-10-30 06:59:18.708'),
('8d8c7380-fdd7-4b3d-a773-9bbb737ca56f','2d90e014-db88-462c-85cf-f40ecbb8da91','2527c0e7-613c-42f8-a415-2f277109578e',0,'2026-10-30 06:59:18.778'),
('8dcb6b4b-2806-429d-8890-1db0eda67ac9','c528369c-e28b-489a-8ab3-4ae3879aca13','ae5a0300-afba-4fa3-a3d7-8018cc2515bb',40,'2026-10-30 06:59:18.256'),
('8e29e0d7-d63d-43cd-80f5-02cee3e8e2e7','76e5709f-7435-4965-8686-8d4a80bc981e','68b3f20f-4e3c-4a95-87e0-fec95ca6aba6',90,'2026-10-30 06:59:18.425'),
('8e2e33b4-52df-4800-801a-fcf8f530a5cb','14ade0d8-8baa-4836-86ed-7092860c45d6','422b0348-c860-4b39-8206-ab784b7864c3',65,'2026-10-30 06:59:18.712'),
('8f9dcba9-6a3f-40e4-b95c-a323eb9000c4','109fa35f-7dea-468e-b9e7-585d82bcf865','3bdd51d5-b75d-41a2-a35b-5b299719b8ae',30,'2026-10-30 06:59:18.332'),
('903a2cf8-6515-4f2d-8adc-d3b45be8542d','d783ea71-c3d3-43b9-86ea-735966c89f30','1cdbb658-d012-44ba-a47a-002e422ac3c5',20,'2026-10-30 06:59:18.622'),
('9523a991-446a-4a8c-908f-dc2676ab73a0','61e91c8d-76c0-458a-9f1a-bd754ecd0994','3522189e-924f-476d-853c-da70c1307b2c',80,'2026-10-30 06:59:18.154'),
('96b106c4-4559-4f32-9102-9fe513565418','679a151e-ff46-423c-ba34-236c3f189be4','740e9a59-71f1-403e-a29e-2223570ea32e',95,'2026-10-30 06:59:18.429'),
('998d4015-f798-4791-a33f-1d7ef7f2610a','f5d826ee-dae5-4a3b-9bab-daf528a2f852','9c17efd9-f399-4a36-9fc1-a3c394a7f028',45,'2026-10-30 06:59:18.539'),
('9f6bb3ca-e30c-4762-a270-6a4ff35ea07e','6aa0d05b-fbbf-4ba4-bb51-55da9741af09','db679747-0597-498a-a527-b315a069c46b',140,'2026-10-30 06:59:18.610'),
('a0f6477a-f6fa-4dbb-994b-69e8f888d9c1','08bb65bd-ab90-4904-8719-d7bb65bbb9b2','76b2c91e-7a1b-4905-9fd2-f166bbf0e938',10,'2026-10-30 06:59:18.548'),
('a77b94e6-005f-489c-b452-6b188d369835','c94c4980-2a88-4d29-a2b5-fbb37261a476','9dcedc07-2032-4e18-aa62-4c031ca0dcc0',30,'2026-10-30 06:59:18.794'),
('ae88f8c6-eee5-430a-9e9f-3e25b9311d27','109fa35f-7dea-468e-b9e7-585d82bcf865','547bbec6-c66b-4f2f-a19c-48156701af08',35,'2026-10-30 06:59:18.365'),
('affaa618-de2c-402d-8583-6a8e829d4f7c','f5d826ee-dae5-4a3b-9bab-daf528a2f852','76b2c91e-7a1b-4905-9fd2-f166bbf0e938',18,'2026-10-30 06:59:18.545'),
('b0276f4f-2377-4dcd-a5d2-226f0df84171','e38291df-5572-409b-bc05-de9834f89fa7','87325e26-a95d-4fcc-bac7-fdc26dcd79d8',80,'2026-10-30 06:59:18.718'),
('b7fc479d-83d9-4fec-9909-36961626e7dc','08bb65bd-ab90-4904-8719-d7bb65bbb9b2','41fb78b0-354d-4b56-a193-c97e451ba133',20,'2026-10-30 06:59:18.534'),
('b9fb0aaf-fab7-4cfd-9376-92dc788480c3','76e5709f-7435-4965-8686-8d4a80bc981e','740e9a59-71f1-403e-a29e-2223570ea32e',50,'2026-10-30 06:59:18.431'),
('c494570c-120b-45d7-8c8e-a0956a58bdfd','f5d826ee-dae5-4a3b-9bab-daf528a2f852','ad1fc621-a208-4cfe-98be-c8bdf414ebf0',35,'2026-10-30 06:59:18.552'),
('c4d43ea4-7218-41ee-a030-3a568d95952f','c94c4980-2a88-4d29-a2b5-fbb37261a476','222919c4-aca2-4653-90dd-901bbd739de7',0,'2026-10-30 06:59:18.772'),
('c4e81c83-49e1-4a87-8100-a66c5d580c5f','e7b87d8d-ee09-4f96-b903-84d312338868','ae5a0300-afba-4fa3-a3d7-8018cc2515bb',25,'2026-10-30 06:59:18.257'),
('c76bccc8-319c-43ea-88e1-48285ca1cb63','08bb65bd-ab90-4904-8719-d7bb65bbb9b2','9c17efd9-f399-4a36-9fc1-a3c394a7f028',25,'2026-10-30 06:59:18.541'),
('c9f330f4-513b-4050-ace9-24ce368b30e0','679a151e-ff46-423c-ba34-236c3f189be4','3bb39b18-f1f3-40fe-b53a-84cb76ae6413',70,'2026-10-30 06:59:18.435'),
('cbdb7ddf-9e02-4738-b0b7-1e28cf3fbddd','e7b87d8d-ee09-4f96-b903-84d312338868','9bcd9840-aa23-4207-bfe0-48676751f835',50,'2026-10-30 06:59:18.247'),
('cc047746-e73a-4949-83ec-9b317219738f','61e91c8d-76c0-458a-9f1a-bd754ecd0994','dd5f0db1-994a-492c-98c6-c99e0ecb7dc8',40,'2026-10-30 06:59:18.176'),
('cfe79eda-9bc9-438e-b58d-9e2858d02591','e7b87d8d-ee09-4f96-b903-84d312338868','8725c93c-8e06-44a2-841a-66155dd293d8',50,'2026-10-30 06:59:18.265'),
('d0bf2135-ffda-47ec-b142-9037f23fd002','e7b87d8d-ee09-4f96-b903-84d312338868','094526d3-336c-459d-a987-c71291051910',30,'2026-10-30 06:59:18.279'),
('d105c77b-2f0b-4ac0-8505-d92c2a46e323','08bb65bd-ab90-4904-8719-d7bb65bbb9b2','ad1fc621-a208-4cfe-98be-c8bdf414ebf0',20,'2026-10-30 06:59:18.553'),
('d45ccdd3-8482-46a9-a8b2-2a8ce358c2a1','14ade0d8-8baa-4836-86ed-7092860c45d6','f95d8d5e-a691-4568-a3d4-d411ed55a6d3',450,'2026-10-30 06:59:18.696'),
('d65fe165-7673-4a62-ad25-189ad326977c','c92c3704-a2ce-45fe-ad6e-c8143d6bad6c','7285731d-ecd7-4f15-90a5-0b4abd23f221',120,'2026-10-30 06:59:18.135'),
('d7d0b9bf-3611-4a1c-8111-1e2dcf136b15','61e91c8d-76c0-458a-9f1a-bd754ecd0994','3d5f2c3a-284d-4568-a64c-f37a5703163e',30,'2026-10-30 06:59:18.144'),
('d88567cf-882c-4fd6-a89d-241b98758ad2','2d90e014-db88-462c-85cf-f40ecbb8da91','222919c4-aca2-4653-90dd-901bbd739de7',0,'2026-10-30 06:59:18.768'),
('d89069af-f9e5-4586-be8e-9dade60e4508','c528369c-e28b-489a-8ab3-4ae3879aca13','4132420c-f8ad-462e-92a9-f4ce6ee034a4',150,'2026-10-30 06:59:18.272'),
('da5cab3e-5f46-4ba9-8b21-3faab5a56f82','14ade0d8-8baa-4836-86ed-7092860c45d6','f3aa0bd5-0056-47d0-b3e1-c43c77bd1426',80,'2026-10-30 06:59:18.701'),
('da793a08-3f39-4438-870f-d5b3124365fb','109fa35f-7dea-468e-b9e7-585d82bcf865','f3b0ab3d-08e3-4d6b-8222-5af37ddbdca3',40,'2026-10-30 06:59:18.354'),
('db3f3dba-8f94-4279-8029-8b8c53bc5b6a','c92c3704-a2ce-45fe-ad6e-c8143d6bad6c','e1a51301-3c34-4697-bc17-d305d2a8e7cc',180,'2026-10-30 06:59:18.159'),
('dda86357-2cec-4d01-86e3-2d25df48618a','c94c4980-2a88-4d29-a2b5-fbb37261a476','b8b179f3-3a99-4e06-866f-28c3da029ce3',25,'2026-10-30 06:59:18.789'),
('de0c9f74-9a1c-44a0-8109-681d7066cbee','c528369c-e28b-489a-8ab3-4ae3879aca13','094526d3-336c-459d-a987-c71291051910',50,'2026-10-30 06:59:18.277'),
('e3cbabc2-53d4-4533-b01b-a63a859ccb66','2d90e014-db88-462c-85cf-f40ecbb8da91','9dcedc07-2032-4e18-aa62-4c031ca0dcc0',45,'2026-10-30 06:59:18.793'),
('e419714c-c297-40af-af67-81037964ec0c','6aa0d05b-fbbf-4ba4-bb51-55da9741af09','dbb4ce13-e642-48c0-83cd-514e2e059945',10,'2026-10-30 06:59:18.598'),
('e581bd4f-19a3-4901-a9aa-c180c8e441c8','d63d3c8c-e540-4240-8d43-d793bb0ed546','547bbec6-c66b-4f2f-a19c-48156701af08',50,'2026-10-30 06:59:18.363'),
('e5a2bdd4-06dd-4d92-91df-5e5dbc6ac190','c528369c-e28b-489a-8ab3-4ae3879aca13','1fc1cf8b-0f94-4862-a33e-d9e5d7010d64',80,'2026-10-30 06:59:18.250'),
('eb0fa27d-1613-4059-8b11-a5df764b7a9d','6aa0d05b-fbbf-4ba4-bb51-55da9741af09','7159f8b7-58fb-4000-8939-1122acc17656',50,'2026-10-30 06:59:18.632'),
('ed0c5cc2-f807-484c-897e-cf573580ccbe','679a151e-ff46-423c-ba34-236c3f189be4','68b3f20f-4e3c-4a95-87e0-fec95ca6aba6',180,'2026-10-30 06:59:18.423'),
('ed343c08-68bf-46e5-b84c-ecc1663c0c1d','679a151e-ff46-423c-ba34-236c3f189be4','48143f0e-d0ed-45bf-8ab1-72a03a828499',35,'2026-10-30 06:59:18.446'),
('efcba7ac-f448-4dbc-8a89-a8e91a54d3d4','d783ea71-c3d3-43b9-86ea-735966c89f30','7159f8b7-58fb-4000-8939-1122acc17656',30,'2026-10-30 06:59:18.636'),
('f02452d0-b1d9-487a-a872-ff6ac41fd2cb','d63d3c8c-e540-4240-8d43-d793bb0ed546','667823b2-a06b-4957-8aa2-1ad139bbaf67',90,'2026-10-30 06:59:18.336'),
('f9c69277-9b20-416f-b915-460fa479f79e','c94c4980-2a88-4d29-a2b5-fbb37261a476','2527c0e7-613c-42f8-a415-2f277109578e',0,'2026-10-30 06:59:18.779'),
('fa6a3d94-8b96-4cee-9fd0-5cb173e002a3','c528369c-e28b-489a-8ab3-4ae3879aca13','9bcd9840-aa23-4207-bfe0-48676751f835',100,'2026-10-30 06:59:18.245'),
('fb68d961-e983-4c80-b076-89bcdb5b6608','109fa35f-7dea-468e-b9e7-585d82bcf865','eae899c0-bb7b-4543-8036-7685c2fba22b',50,'2026-10-30 06:59:18.326');
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventorymovement`
--

DROP TABLE IF EXISTS `inventorymovement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventorymovement` (
  `id` varchar(191) NOT NULL,
  `branchId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `quantity` double NOT NULL,
  `balanceAfter` double NOT NULL,
  `referenceId` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `InventoryMovement_branchId_productId_idx` (`branchId`,`productId`),
  KEY `InventoryMovement_referenceId_idx` (`referenceId`),
  KEY `InventoryMovement_createdAt_idx` (`createdAt`),
  KEY `InventoryMovement_productId_fkey` (`productId`),
  CONSTRAINT `InventoryMovement_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `InventoryMovement_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventorymovement`
--

LOCK TABLES `inventorymovement` WRITE;
/*!40000 ALTER TABLE `inventorymovement` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventorymovement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `id` varchar(191) NOT NULL,
  `saleId` varchar(191) NOT NULL,
  `method` varchar(191) NOT NULL DEFAULT 'CASH',
  `amount` double NOT NULL,
  `tenderedAmount` double DEFAULT NULL,
  `changeAmount` double DEFAULT NULL,
  `transactionRef` varchar(191) DEFAULT NULL,
  `paidAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `Payment_saleId_idx` (`saleId`),
  CONSTRAINT `Payment_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sale` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES
('0181953d-26c4-41e5-bffc-ea4c86691162','34f0c713-09c6-4d11-9b31-917dc41741d9','CASH',9500,10000,500,NULL,'2026-10-30 06:59:18.801'),
('0a9c1821-0ba9-45e2-bb97-6b1403ccbb49','55bca036-d525-4886-a545-63fda542e6d3','CASH',12200,12700,500,NULL,'2026-10-30 06:59:18.560'),
('1d8406d4-b7bb-4088-b1d2-92af135281a6','8a2294df-e560-4a8a-8200-2634c5c0be33','CASH',694500,695000,500,NULL,'2026-10-30 06:59:18.646'),
('1eb476d5-ebb5-424b-823a-e23fbc5a9eed','f632be50-f008-4ac3-afda-0c8e7b4ff89b','CASH',400,900,500,NULL,'2026-10-30 06:59:18.373'),
('8a83f28d-bb24-4d10-95ed-05066b018347','8c47f68d-4610-45b1-a7cc-abdcc7196684','CASH',920,1420,500,NULL,'2026-10-30 06:59:18.189'),
('bf3fa428-7064-4c09-a5f1-fe3957d159b9','159b0ef0-73de-49a3-bad1-5fb3d21df47a','CASH',4550,5050,500,NULL,'2026-10-30 06:59:18.285'),
('d6fec5e4-1ecc-4418-9490-3840e1ac4045','394b92d5-14f5-4ca4-8750-ae39dc09c33e','CASH',710,1210,500,NULL,'2026-10-30 06:59:18.454'),
('e12e97aa-c58e-4290-a9f5-152ffcb82d4c','4e01c4eb-f942-41aa-bde7-f48dcf50245c','CASH',12100,12600,500,NULL,'2026-10-30 06:59:18.725');
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `categoryId` varchar(191) DEFAULT NULL,
  `supplierId` varchar(191) DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `sku` varchar(191) DEFAULT NULL,
  `barcode` varchar(191) DEFAULT NULL,
  `description` varchar(191) DEFAULT NULL,
  `costPrice` double NOT NULL DEFAULT 0,
  `sellingPrice` double NOT NULL,
  `discountPrice` double DEFAULT NULL,
  `minStockLevel` int(11) NOT NULL DEFAULT 5,
  `unit` varchar(191) NOT NULL DEFAULT 'pcs',
  `imageUrl` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Product_businessId_sku_key` (`businessId`,`sku`),
  UNIQUE KEY `Product_businessId_barcode_key` (`businessId`,`barcode`),
  KEY `Product_businessId_name_idx` (`businessId`,`name`),
  KEY `Product_businessId_categoryId_idx` (`businessId`,`categoryId`),
  KEY `Product_categoryId_fkey` (`categoryId`),
  KEY `Product_supplierId_fkey` (`supplierId`),
  CONSTRAINT `Product_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Product_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES
('094526d3-336c-459d-a987-c71291051910','c2b7949b-dd30-47cf-9d04-c2062240278f','d37fa0b0-081a-43b1-bde9-a25147e7afdd','sup-t2g-cafe','Avocado Honey Smoothie','REST-JUC-01','479300100106',NULL,320,550,NULL,10,'glass',NULL,1,'2026-10-30 06:59:18.275','2026-10-30 06:59:18.275'),
('1cdbb658-d012-44ba-a47a-002e422ac3c5','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','656756db-92a0-4374-8a9b-bb7125fa9664','sup-t2g-tech','Joyroom 10000mAh Magnetic Power Bank','TECH-PWR-10K','479700100104',NULL,4200,6800,NULL,8,'pcs',NULL,1,'2026-10-30 06:59:18.614','2026-10-30 06:59:18.614'),
('1fc1cf8b-0f94-4862-a33e-d9e5d7010d64','c2b7949b-dd30-47cf-9d04-c2062240278f','22492cc4-2105-4114-a84d-2a78b947d919','sup-t2g-cafe','Seafood Mixed Fried Rice Special','REST-RIC-01','479300100102',NULL,1100,1650,NULL,10,'plate',NULL,1,'2026-10-30 06:59:18.248','2026-10-30 06:59:18.248'),
('222919c4-aca2-4653-90dd-901bbd739de7','ef520599-7256-4dc1-98b5-ba69ecc3e080','e715d77d-1b4a-4610-8106-3639a4fe3f06','sup-t2g-salon','Classic Executive Haircut & Beard Grooming','SAL-CUT-01','479900100101',NULL,0,1500,NULL,0,'service',NULL,1,'2026-10-30 06:59:18.763','2026-10-30 06:59:18.763'),
('2527c0e7-613c-42f8-a415-2f277109578e','ef520599-7256-4dc1-98b5-ba69ecc3e080','e715d77d-1b4a-4610-8106-3639a4fe3f06','sup-t2g-salon','Keratin Deep Conditioning Hair Spa','SAL-SPA-01','479900100102',NULL,0,6500,NULL,0,'session',NULL,1,'2026-10-30 06:59:18.776','2026-10-30 06:59:18.776'),
('3438b856-6217-40f7-952f-e946c1355e57','6c52f25b-187b-48a1-a909-dbe5a961561c','be62da0b-57a1-4b05-8913-69a3ab72953b','sup-t2g-pharm','Paracetamol 500mg (10x Strips)','PHARM-PCM-01','479500100101',NULL,120,180,NULL,50,'strip',NULL,1,'2026-10-30 06:59:18.414','2026-10-30 06:59:18.414'),
('3522189e-924f-476d-853c-da70c1307b2c','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','4c2275ef-3780-43a2-8e75-817e1f731fe2','sup-t2g-grocery','Mysore Red Dhal 500g','GR-DHL-01','479200100104',NULL,210,260,NULL,25,'pack',NULL,1,'2026-10-30 06:59:18.151','2026-10-30 06:59:18.151'),
('3bb39b18-f1f3-40fe-b53a-84cb76ae6413','6c52f25b-187b-48a1-a909-dbe5a961561c','fa8ce256-2bfe-4664-80d5-a7a44e5b1db0','sup-t2g-pharm','Vitamin C 1000mg Effervescent (20s)','PHARM-VTC-01','479500100104',NULL,850,1250,NULL,15,'pack',NULL,1,'2026-10-30 06:59:18.433','2026-10-30 06:59:18.433'),
('3bdd51d5-b75d-41a2-a35b-5b299719b8ae','8297bbf8-4101-473d-a2e5-267f06286bef','e86b2a42-3169-41e0-89fc-c05c9f5a8a51','sup-t2g-bakery','Chocolate Fudge Gateau Slice','BAKE-CAK-01','479400100103',NULL,220,390,NULL,10,'slice',NULL,1,'2026-10-30 06:59:18.328','2026-10-30 06:59:18.328'),
('3d5f2c3a-284d-4568-a64c-f37a5703163e','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','4ee65dd6-7eb3-4f51-afbf-eff0458b8532','sup-t2g-grocery','Highland Fresh Milk 1L','GR-MLK-01','479200100102',NULL,420,520,NULL,15,'bottle',NULL,1,'2026-10-30 06:59:18.140','2026-10-30 06:59:18.140'),
('3f348e8e-c89e-4b25-a250-fcf0fcb2f1fd','505ffc4c-398e-471a-8547-80e5016e1c23','bc10b60e-adde-4890-bd6e-e5c51d296655','sup-t2g-wholesale','Philips Essential LED Bulbs 9W (Carton of 50)','WHOLE-LED-50','479800100103',NULL,18500,23500,NULL,10,'box',NULL,1,'2026-10-30 06:59:18.704','2026-10-30 06:59:18.704'),
('4132420c-f8ad-462e-92a9-f4ce6ee034a4','c2b7949b-dd30-47cf-9d04-c2062240278f','c0bfd90e-53c1-4844-9d96-b24a2683b90b','sup-t2g-cafe','Ceylon Cardamom Milk Tea','REST-TEA-01','479300100105',NULL,80,160,NULL,20,'cup',NULL,1,'2026-10-30 06:59:18.270','2026-10-30 06:59:18.270'),
('41fb78b0-354d-4b56-a193-c97e451ba133','8378e480-a786-4700-a328-900ec83a3a77','015d2fcb-7748-44d6-8d54-a98b9433e206','sup-t2g-fashion','Women\'s Floral Summer Wrap Dress (M)','CLOTH-DRS-01','479600100102',NULL,2600,4500,NULL,8,'pcs',NULL,1,'2026-10-30 06:59:18.530','2026-10-30 06:59:18.530'),
('422b0348-c860-4b39-8206-ab784b7864c3','505ffc4c-398e-471a-8547-80e5016e1c23','f23e43f3-f6ed-4a66-b548-fd7fe2dde3ab','sup-t2g-wholesale','GI Galvanized Binding Wire (25kg Roll)','WHOLE-WIR-25','479800100104',NULL,7200,9400,NULL,15,'roll',NULL,1,'2026-10-30 06:59:18.709','2026-10-30 06:59:18.709'),
('48143f0e-d0ed-45bf-8ab1-72a03a828499','6c52f25b-187b-48a1-a909-dbe5a961561c','4462f64f-97d0-4924-9ef5-2cdbab2648f6','sup-t2g-pharm','Digital Fast Reading Thermometer','PHARM-THM-01','479500100106',NULL,650,1100,NULL,10,'pcs',NULL,1,'2026-10-30 06:59:18.444','2026-10-30 06:59:18.444'),
('547bbec6-c66b-4f2f-a19c-48156701af08','8297bbf8-4101-473d-a2e5-267f06286bef','bc3d22e6-60ae-4184-bf69-25e5e001aa8f','sup-t2g-bakery','Chilled Cream Iced Coffee','BAKE-COF-01','479400100106',NULL,120,250,NULL,10,'cup',NULL,1,'2026-10-30 06:59:18.359','2026-10-30 06:59:18.359'),
('6041a1f1-3630-46a4-9352-98405aa01116','ef520599-7256-4dc1-98b5-ba69ecc3e080','05b4bcb6-7bc8-4e3d-9a18-347a502436ed','sup-t2g-salon','Herbal Glow Deep Cleansing Facial','SAL-FAC-01','479900100103',NULL,0,4500,NULL,0,'session',NULL,1,'2026-10-30 06:59:18.780','2026-10-30 06:59:18.780'),
('608ca4c7-712c-4d17-8cc8-7d3bb97edabc','8378e480-a786-4700-a328-900ec83a3a77','d90d83b7-7166-44a1-aadb-3fda1d0ed478','sup-t2g-fashion','Men\'s Slim Fit Linen Shirt (Navy - L)','CLOTH-SHR-01','479600100101',NULL,2200,3850,NULL,10,'pcs',NULL,1,'2026-10-30 06:59:18.522','2026-10-30 06:59:18.522'),
('667823b2-a06b-4957-8aa2-1ad139bbaf67','8297bbf8-4101-473d-a2e5-267f06286bef','d3d7553f-1b11-4556-940e-3ee32bb13f89','sup-t2g-bakery','Fresh Woodfired Roast Bread','BAKE-BRD-01','479400100104',NULL,110,180,NULL,15,'loaf',NULL,1,'2026-10-30 06:59:18.334','2026-10-30 06:59:18.334'),
('68b3f20f-4e3c-4a95-87e0-fec95ca6aba6','6c52f25b-187b-48a1-a909-dbe5a961561c','be62da0b-57a1-4b05-8913-69a3ab72953b','sup-t2g-pharm','Panadol Actifast Rapid Relief','PHARM-PAN-01','479500100102',NULL,240,350,NULL,30,'strip',NULL,1,'2026-10-30 06:59:18.421','2026-10-30 06:59:18.421'),
('7159f8b7-58fb-4000-8939-1122acc17656','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','942d71bb-5721-41fb-a89a-417eafa47e02','sup-t2g-tech','Anker Braided USB-C to Lightning Cable','TECH-CBL-ANK','479700100105',NULL,1800,3200,NULL,15,'pcs',NULL,1,'2026-10-30 06:59:18.627','2026-10-30 06:59:18.627'),
('7285731d-ecd7-4f15-90a5-0b4abd23f221','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','ef52a1de-96ca-4316-8d83-dcca0eef4dab','sup-t2g-grocery','Keells Marie Biscuits 200g','GR-BIS-01','479200100101',NULL,150,200,NULL,20,'pcs',NULL,1,'2026-10-30 06:59:18.131','2026-10-30 06:59:18.131'),
('740e9a59-71f1-403e-a29e-2223570ea32e','6c52f25b-187b-48a1-a909-dbe5a961561c','b236c493-5591-471d-8168-b00ae85ee6e3','sup-t2g-pharm','Amoxicillin 250mg Capsules (10s)','PHARM-AMX-01','479500100103',NULL,380,550,NULL,20,'strip',NULL,1,'2026-10-30 06:59:18.427','2026-10-30 06:59:18.427'),
('76b2c91e-7a1b-4905-9fd2-f166bbf0e938','8378e480-a786-4700-a328-900ec83a3a77','ca9ed794-427a-4fd2-bc2a-b3d7f437367e','sup-t2g-fashion','Pure Silk Handloom Kandyan Saree','CLOTH-SAR-01','479600100104',NULL,7500,14500,NULL,5,'pcs',NULL,1,'2026-10-30 06:59:18.543','2026-10-30 06:59:18.543'),
('7c0ce770-8b83-46cb-ac1c-aa8924c14559','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','4c2275ef-3780-43a2-8e75-817e1f731fe2','sup-t2g-grocery','White Sugar 1kg Pack','GR-SUG-01','479200100103',NULL,240,290,NULL,30,'kg',NULL,1,'2026-10-30 06:59:18.146','2026-10-30 06:59:18.146'),
('8725c93c-8e06-44a2-841a-66155dd293d8','c2b7949b-dd30-47cf-9d04-c2062240278f','d37fa0b0-081a-43b1-bde9-a25147e7afdd','sup-t2g-cafe','Ice Milo Dinosaur Cream','REST-MILO-01','479300100104',NULL,280,480,NULL,15,'glass',NULL,1,'2026-10-30 06:59:18.259','2026-10-30 06:59:18.259'),
('87325e26-a95d-4fcc-bac7-fdc26dcd79d8','505ffc4c-398e-471a-8547-80e5016e1c23','c14584b5-f7e7-4538-b2fd-90ca373662c3','sup-t2g-wholesale','Asian Paints Wall Putty (20kg Bag)','WHOLE-PUT-20','479800100105',NULL,1850,2350,NULL,25,'bag',NULL,1,'2026-10-30 06:59:18.715','2026-10-30 06:59:18.715'),
('9bcd9840-aa23-4207-bfe0-48676751f835','c2b7949b-dd30-47cf-9d04-c2062240278f','153b89cc-ad75-4623-96a9-83e7030cd0ae','sup-t2g-cafe','Chicken Cheese Kottu (Full)','REST-KOT-01','479300100101',NULL,950,1450,NULL,10,'portion',NULL,1,'2026-10-30 06:59:18.243','2026-10-30 06:59:18.243'),
('9c17efd9-f399-4a36-9fc1-a3c394a7f028','8378e480-a786-4700-a328-900ec83a3a77','d90d83b7-7166-44a1-aadb-3fda1d0ed478','sup-t2g-fashion','Cotton Chino Trousers (32W Khaki)','CLOTH-CHN-01','479600100103',NULL,2100,3600,NULL,10,'pcs',NULL,1,'2026-10-30 06:59:18.537','2026-10-30 06:59:18.537'),
('9dcedc07-2032-4e18-aa62-4c031ca0dcc0','ef520599-7256-4dc1-98b5-ba69ecc3e080','05b4bcb6-7bc8-4e3d-9a18-347a502436ed','sup-t2g-salon','Organic Charcoal Purifying Face Scrub 100g','SAL-SCR-01','479900100105',NULL,850,1650,NULL,10,'pcs',NULL,1,'2026-10-30 06:59:18.791','2026-10-30 06:59:18.791'),
('ad1fc621-a208-4cfe-98be-c8bdf414ebf0','8378e480-a786-4700-a328-900ec83a3a77','5f4990ed-45f3-49b0-bfff-b809172a2524','sup-t2g-fashion','Genuine Leather Casual Waist Belt','CLOTH-BLT-01','479600100105',NULL,950,1850,NULL,10,'pcs',NULL,1,'2026-10-30 06:59:18.549','2026-10-30 06:59:18.549'),
('ae5a0300-afba-4fa3-a3d7-8018cc2515bb','c2b7949b-dd30-47cf-9d04-c2062240278f','22492cc4-2105-4114-a84d-2a78b947d919','sup-t2g-cafe','Chicken Biryani Pot (With Egg & Roast)','REST-BIR-01','479300100103',NULL,1200,1750,NULL,5,'portion',NULL,1,'2026-10-30 06:59:18.254','2026-10-30 06:59:18.254'),
('b2438eaa-e3ac-4775-8204-527827f2d20e','8297bbf8-4101-473d-a2e5-267f06286bef','bc3d22e6-60ae-4184-bf69-25e5e001aa8f','sup-t2g-bakery','Malu Paan (Spicy Fish Bun)','BAKE-BUN-01','479400100101',NULL,65,120,NULL,20,'pcs',NULL,1,'2026-10-30 06:59:18.317','2026-10-30 06:59:18.317'),
('b8b179f3-3a99-4e06-866f-28c3da029ce3','ef520599-7256-4dc1-98b5-ba69ecc3e080','ddb4520d-741f-4c0e-8f28-b825335c9995','sup-t2g-salon','Pure Moroccan Argan Hair Serum 100ml','SAL-OIL-01','479900100104',NULL,2400,4200,NULL,8,'bottle',NULL,1,'2026-10-30 06:59:18.785','2026-10-30 06:59:18.785'),
('c0bd7ce5-35ef-40b1-8047-dc4af41a84c1','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','942d71bb-5721-41fb-a89a-417eafa47e02','sup-t2g-tech','Samsung 25W Type-C Super Fast Charger','TECH-CHG-25W','479700100102',NULL,2800,4500,NULL,10,'pcs',NULL,1,'2026-10-30 06:59:18.602','2026-10-30 06:59:18.602'),
('d6785560-1efd-4a78-a229-feedaaa3e8bb','6c52f25b-187b-48a1-a909-dbe5a961561c','4462f64f-97d0-4924-9ef5-2cdbab2648f6','sup-t2g-pharm','Dettol Antiseptic Liquid 250ml','PHARM-DET-01','479500100105',NULL,480,680,NULL,10,'bottle',NULL,1,'2026-10-30 06:59:18.438','2026-10-30 06:59:18.438'),
('db679747-0597-498a-a527-b315a069c46b','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','1b587022-928b-48a5-855c-ed95751a1f18','sup-t2g-tech','9D Curved Tempered Glass iPhone 14/15','TECH-GLS-9D','479700100103',NULL,450,1200,NULL,25,'pcs',NULL,1,'2026-10-30 06:59:18.608','2026-10-30 06:59:18.608'),
('dbb4ce13-e642-48c0-83cd-514e2e059945','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','833d0471-ed5c-456a-893a-ee0a262abdfd','sup-t2g-tech','Apple iPhone 15 Pro 128GB Titanium','TECH-IPH-15P','479700100101',NULL,310000,345000,NULL,2,'unit',NULL,1,'2026-10-30 06:59:18.596','2026-10-30 06:59:18.596'),
('dd5f0db1-994a-492c-98c6-c99e0ecb7dc8','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','4ee65dd6-7eb3-4f51-afbf-eff0458b8532','sup-t2g-grocery','Dilmah Premium Ceylon Tea 100g','GR-TEA-01','479200100106',NULL,320,410,NULL,15,'pack',NULL,1,'2026-10-30 06:59:18.162','2026-10-30 06:59:18.162'),
('e1a51301-3c34-4697-bc17-d305d2a8e7cc','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','5982d682-702d-4bf8-b712-d3a907387116','sup-t2g-grocery','Sunlight Lemon Soap 100g','GR-SOP-01','479200100105',NULL,110,145,NULL,20,'pcs',NULL,1,'2026-10-30 06:59:18.156','2026-10-30 06:59:18.156'),
('eae899c0-bb7b-4543-8036-7685c2fba22b','8297bbf8-4101-473d-a2e5-267f06286bef','70043056-30d0-4d17-88c2-ba091f32e8fc','sup-t2g-bakery','Chicken Sausage Puff Roll','BAKE-ROL-01','479400100102',NULL,90,160,NULL,15,'pcs',NULL,1,'2026-10-30 06:59:18.322','2026-10-30 06:59:18.322'),
('f3aa0bd5-0056-47d0-b3e1-c43c77bd1426','505ffc4c-398e-471a-8547-80e5016e1c23','6feee49b-d3bf-4076-be95-ed0a090a86b4','sup-t2g-wholesale','S-lon PVC Pressure Pipe 1-inch (Bundle of 10)','WHOLE-PVC-01','479800100102',NULL,5800,7200,NULL,15,'bundle',NULL,1,'2026-10-30 06:59:18.699','2026-10-30 06:59:18.699'),
('f3b0ab3d-08e3-4d6b-8222-5af37ddbdca3','8297bbf8-4101-473d-a2e5-267f06286bef','bc3d22e6-60ae-4184-bf69-25e5e001aa8f','sup-t2g-bakery','Glazed Sugar Donut','BAKE-DON-01','479400100105',NULL,85,150,NULL,15,'pcs',NULL,1,'2026-10-30 06:59:18.342','2026-10-30 06:59:18.342'),
('f95d8d5e-a691-4568-a3d4-d411ed55a6d3','505ffc4c-398e-471a-8547-80e5016e1c23','c14584b5-f7e7-4538-b2fd-90ca373662c3','sup-t2g-wholesale','Tokyo Super Portland Cement 50kg Bag','WHOLE-CEM-50','479800100101',NULL,2150,2450,NULL,50,'bag',NULL,1,'2026-10-30 06:59:18.694','2026-10-30 06:59:18.694');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase`
--

DROP TABLE IF EXISTS `purchase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase` (
  `id` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `branchId` varchar(191) NOT NULL,
  `supplierId` varchar(191) NOT NULL,
  `invoiceNumber` varchar(191) NOT NULL,
  `subtotal` double NOT NULL,
  `tax` double NOT NULL DEFAULT 0,
  `discount` double NOT NULL DEFAULT 0,
  `total` double NOT NULL,
  `paidAmount` double NOT NULL DEFAULT 0,
  `isCompleted` tinyint(1) NOT NULL DEFAULT 1,
  `purchaseDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Purchase_businessId_invoiceNumber_key` (`businessId`,`invoiceNumber`),
  KEY `Purchase_businessId_idx` (`businessId`),
  KEY `Purchase_branchId_idx` (`branchId`),
  KEY `Purchase_supplierId_fkey` (`supplierId`),
  CONSTRAINT `Purchase_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Purchase_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Purchase_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase`
--

LOCK TABLES `purchase` WRITE;
/*!40000 ALTER TABLE `purchase` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchaseitem`
--

DROP TABLE IF EXISTS `purchaseitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchaseitem` (
  `id` varchar(191) NOT NULL,
  `purchaseId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `quantity` double NOT NULL,
  `unitCost` double NOT NULL,
  `totalCost` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `PurchaseItem_purchaseId_idx` (`purchaseId`),
  KEY `PurchaseItem_productId_fkey` (`productId`),
  CONSTRAINT `PurchaseItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `PurchaseItem_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `purchase` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchaseitem`
--

LOCK TABLES `purchaseitem` WRITE;
/*!40000 ALTER TABLE `purchaseitem` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchaseitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `return`
--

DROP TABLE IF EXISTS `return`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `return` (
  `id` varchar(191) NOT NULL,
  `saleId` varchar(191) NOT NULL,
  `returnNumber` varchar(191) NOT NULL,
  `refundAmount` double NOT NULL,
  `reason` varchar(191) NOT NULL,
  `processedById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `Return_saleId_idx` (`saleId`),
  CONSTRAINT `Return_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sale` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `return`
--

LOCK TABLES `return` WRITE;
/*!40000 ALTER TABLE `return` DISABLE KEYS */;
/*!40000 ALTER TABLE `return` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `returnitem`
--

DROP TABLE IF EXISTS `returnitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `returnitem` (
  `id` varchar(191) NOT NULL,
  `returnId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `quantity` double NOT NULL,
  `refundPrice` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ReturnItem_returnId_idx` (`returnId`),
  CONSTRAINT `ReturnItem_returnId_fkey` FOREIGN KEY (`returnId`) REFERENCES `return` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `returnitem`
--

LOCK TABLES `returnitem` WRITE;
/*!40000 ALTER TABLE `returnitem` DISABLE KEYS */;
/*!40000 ALTER TABLE `returnitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale`
--

DROP TABLE IF EXISTS `sale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale` (
  `id` varchar(191) NOT NULL,
  `invoiceNumber` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `branchId` varchar(191) NOT NULL,
  `cashierId` varchar(191) NOT NULL,
  `customerId` varchar(191) DEFAULT NULL,
  `subtotal` double NOT NULL,
  `discount` double NOT NULL DEFAULT 0,
  `tax` double NOT NULL DEFAULT 0,
  `total` double NOT NULL,
  `totalCost` double NOT NULL DEFAULT 0,
  `status` varchar(191) NOT NULL DEFAULT 'COMPLETED',
  `holdNote` varchar(191) DEFAULT NULL,
  `saleDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Sale_businessId_invoiceNumber_key` (`businessId`,`invoiceNumber`),
  KEY `Sale_businessId_saleDate_idx` (`businessId`,`saleDate`),
  KEY `Sale_branchId_saleDate_idx` (`branchId`,`saleDate`),
  KEY `Sale_cashierId_idx` (`cashierId`),
  KEY `Sale_customerId_fkey` (`customerId`),
  CONSTRAINT `Sale_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Sale_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Sale_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Sale_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale`
--

LOCK TABLES `sale` WRITE;
/*!40000 ALTER TABLE `sale` DISABLE KEYS */;
INSERT INTO `sale` VALUES
('159b0ef0-73de-49a3-bad1-5fb3d21df47a','INV-T2G-CAFE-0001','c2b7949b-dd30-47cf-9d04-c2062240278f','c528369c-e28b-489a-8ab3-4ae3879aca13','44601d6e-d03f-4d20-9c3d-d1f58ade1192','6ae5e2cd-87f3-461d-b4d3-fa5c610695c9',4550,0,0,4550,3000,'COMPLETED',NULL,'2026-10-30 06:59:18.283','2026-10-30 06:59:18.285','2026-10-30 06:59:18.285'),
('34f0c713-09c6-4d11-9b31-917dc41741d9','INV-T2G-SALON-0001','ef520599-7256-4dc1-98b5-ba69ecc3e080','2d90e014-db88-462c-85cf-f40ecbb8da91','b29b5280-8565-4b4a-95d0-27069354a452','796a0dc0-c104-4b28-8536-ba3d762a18fe',9500,0,0,9500,0,'COMPLETED',NULL,'2026-10-30 06:59:18.799','2026-10-30 06:59:18.801','2026-10-30 06:59:18.801'),
('394b92d5-14f5-4ca4-8750-ae39dc09c33e','INV-T2G-PHARM-0001','6c52f25b-187b-48a1-a909-dbe5a961561c','679a151e-ff46-423c-ba34-236c3f189be4','626ae0c2-76e8-4bb5-9216-41cc27f88486','eb16324f-1959-4c2f-8558-9a189e36fcac',710,0,0,710,480,'COMPLETED',NULL,'2026-10-30 06:59:18.452','2026-10-30 06:59:18.454','2026-10-30 06:59:18.454'),
('4e01c4eb-f942-41aa-bde7-f48dcf50245c','INV-T2G-WHOLESALE-0001','505ffc4c-398e-471a-8547-80e5016e1c23','14ade0d8-8baa-4836-86ed-7092860c45d6','da7a7e9f-1666-4717-944e-ac4490530e9f','8cb4e959-1923-4a4f-9c22-f9b9a3c3962a',12100,0,0,12100,10100,'COMPLETED',NULL,'2026-10-30 06:59:18.723','2026-10-30 06:59:18.725','2026-10-30 06:59:18.725'),
('55bca036-d525-4886-a545-63fda542e6d3','INV-T2G-FASHION-0001','8378e480-a786-4700-a328-900ec83a3a77','f5d826ee-dae5-4a3b-9bab-daf528a2f852','0a4a23ef-0e95-4975-9fa4-79bd67b0c351','7ca8105d-5928-4243-86b1-e1a28cbdbc01',12200,0,0,12200,7000,'COMPLETED',NULL,'2026-10-30 06:59:18.558','2026-10-30 06:59:18.560','2026-10-30 06:59:18.560'),
('8a2294df-e560-4a8a-8200-2634c5c0be33','INV-T2G-TECH-0001','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','6aa0d05b-fbbf-4ba4-bb51-55da9741af09','46fd6a4c-77a7-46d5-9718-ee013cd9ab76','b2d1ff7f-5df5-4273-9dd0-00a52e7a97db',694500,0,0,694500,622800,'COMPLETED',NULL,'2026-10-30 06:59:18.645','2026-10-30 06:59:18.646','2026-10-30 06:59:18.646'),
('8c47f68d-4610-45b1-a7cc-abdcc7196684','INV-T2G-GROCERY-0001','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','c92c3704-a2ce-45fe-ad6e-c8143d6bad6c','e4fbf10a-1012-43a8-aa3d-207e7fbc253c','9a69fa51-82b1-4647-9137-3109ba1063b8',920,0,0,920,720,'COMPLETED',NULL,'2026-10-30 06:59:18.187','2026-10-30 06:59:18.189','2026-10-30 06:59:18.189'),
('f632be50-f008-4ac3-afda-0c8e7b4ff89b','INV-T2G-BAKERY-0001','8297bbf8-4101-473d-a2e5-267f06286bef','d63d3c8c-e540-4240-8d43-d793bb0ed546','1011adbd-9744-4941-b3c1-b5125340af27','34dc43ee-e8a0-4c1e-9fef-c6597081a2ac',400,0,0,400,220,'COMPLETED',NULL,'2026-10-30 06:59:18.372','2026-10-30 06:59:18.373','2026-10-30 06:59:18.373');
/*!40000 ALTER TABLE `sale` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saleitem`
--

DROP TABLE IF EXISTS `saleitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `saleitem` (
  `id` varchar(191) NOT NULL,
  `saleId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `productName` varchar(191) NOT NULL,
  `quantity` double NOT NULL,
  `unitPrice` double NOT NULL,
  `unitCost` double NOT NULL DEFAULT 0,
  `discount` double NOT NULL DEFAULT 0,
  `total` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `SaleItem_saleId_idx` (`saleId`),
  KEY `SaleItem_productId_idx` (`productId`),
  CONSTRAINT `SaleItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `SaleItem_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sale` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saleitem`
--

LOCK TABLES `saleitem` WRITE;
/*!40000 ALTER TABLE `saleitem` DISABLE KEYS */;
INSERT INTO `saleitem` VALUES
('2095a054-4f70-4728-95d0-eb793e866dc4','8a2294df-e560-4a8a-8200-2634c5c0be33','dbb4ce13-e642-48c0-83cd-514e2e059945','Apple iPhone 15 Pro 128GB Titanium',2,345000,310000,0,690000),
('2931d857-f3b0-41bb-ad5c-32f7fbdfed10','f632be50-f008-4ac3-afda-0c8e7b4ff89b','b2438eaa-e3ac-4775-8204-527827f2d20e','Malu Paan (Spicy Fish Bun)',2,120,65,0,240),
('3c8309c4-f994-4d0a-885a-b21d72ed1de5','34f0c713-09c6-4d11-9b31-917dc41741d9','222919c4-aca2-4653-90dd-901bbd739de7','Classic Executive Haircut & Beard Grooming',2,1500,0,0,3000),
('5b4fad6a-f949-4a16-a42a-edc3a5d48946','55bca036-d525-4886-a545-63fda542e6d3','41fb78b0-354d-4b56-a193-c97e451ba133','Women\'s Floral Summer Wrap Dress (M)',1,4500,2600,0,4500),
('86f6edf6-f8bc-4272-9f28-b13d3c20d495','159b0ef0-73de-49a3-bad1-5fb3d21df47a','9bcd9840-aa23-4207-bfe0-48676751f835','Chicken Cheese Kottu (Full)',2,1450,950,0,2900),
('8bd984e4-f152-4e2f-85e3-6a2002f233fa','f632be50-f008-4ac3-afda-0c8e7b4ff89b','eae899c0-bb7b-4543-8036-7685c2fba22b','Chicken Sausage Puff Roll',1,160,90,0,160),
('8e04f7d5-4dbd-4aa0-9673-1c7752b3ef99','34f0c713-09c6-4d11-9b31-917dc41741d9','2527c0e7-613c-42f8-a415-2f277109578e','Keratin Deep Conditioning Hair Spa',1,6500,0,0,6500),
('92472d22-6a28-4a4f-95be-cd5830116956','4e01c4eb-f942-41aa-bde7-f48dcf50245c','f95d8d5e-a691-4568-a3d4-d411ed55a6d3','Tokyo Super Portland Cement 50kg Bag',2,2450,2150,0,4900),
('96d02967-6702-4b5c-a177-2d631daa6158','4e01c4eb-f942-41aa-bde7-f48dcf50245c','f3aa0bd5-0056-47d0-b3e1-c43c77bd1426','S-lon PVC Pressure Pipe 1-inch (Bundle of 10)',1,7200,5800,0,7200),
('9d920788-29bb-422b-b4d6-12aae7a3e7ca','8c47f68d-4610-45b1-a7cc-abdcc7196684','7285731d-ecd7-4f15-90a5-0b4abd23f221','Keells Marie Biscuits 200g',2,200,150,0,400),
('afb747be-9f6b-4570-8b0e-6c2aca761e48','159b0ef0-73de-49a3-bad1-5fb3d21df47a','1fc1cf8b-0f94-4862-a33e-d9e5d7010d64','Seafood Mixed Fried Rice Special',1,1650,1100,0,1650),
('c00caa8d-ab07-4a9c-a33a-40c78ec47f58','8a2294df-e560-4a8a-8200-2634c5c0be33','c0bd7ce5-35ef-40b1-8047-dc4af41a84c1','Samsung 25W Type-C Super Fast Charger',1,4500,2800,0,4500),
('d9da1125-a83e-483d-92ac-7fb4ad576400','394b92d5-14f5-4ca4-8750-ae39dc09c33e','3438b856-6217-40f7-952f-e946c1355e57','Paracetamol 500mg (10x Strips)',2,180,120,0,360),
('dd786500-997d-4079-9fe0-9d7d13ede047','8c47f68d-4610-45b1-a7cc-abdcc7196684','3d5f2c3a-284d-4568-a64c-f37a5703163e','Highland Fresh Milk 1L',1,520,420,0,520),
('f713bec6-fa06-4174-81f9-540cb997d115','394b92d5-14f5-4ca4-8750-ae39dc09c33e','68b3f20f-4e3c-4a95-87e0-fec95ca6aba6','Panadol Actifast Rapid Relief',1,350,240,0,350),
('fc53f455-ce12-4629-9290-369b64edec13','55bca036-d525-4886-a545-63fda542e6d3','608ca4c7-712c-4d17-8cc8-7d3bb97edabc','Men\'s Slim Fit Linen Shirt (Navy - L)',2,3850,2200,0,7700);
/*!40000 ALTER TABLE `saleitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `session` (
  `id` varchar(191) NOT NULL,
  `sessionToken` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `activeBusinessId` varchar(191) DEFAULT NULL,
  `activeBranchId` varchar(191) DEFAULT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `userAgent` varchar(191) DEFAULT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Session_sessionToken_key` (`sessionToken`),
  KEY `Session_sessionToken_idx` (`sessionToken`),
  KEY `Session_userId_idx` (`userId`),
  CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session`
--

LOCK TABLES `session` WRITE;
/*!40000 ALTER TABLE `session` DISABLE KEYS */;
INSERT INTO `session` VALUES
('05af448e-c68d-44eb-acfc-33ff6cd02891','cbeda3b5a2b62e4dc9d0483b32f4ffc0d48889d358b155a255e9b93fabb4b531','46fd6a4c-77a7-46d5-9718-ee013cd9ab76','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','6aa0d05b-fbbf-4ba4-bb51-55da9741af09','::1','node','2026-11-06 06:59:48.156','2026-10-30 06:59:48.158'),
('11e355a7-6082-4cbb-9874-c4f96e808c20','32a746c8e35bf716e609eecbd1b32b5dae90b7b23b538ce3465c422599d1f534','dd7d8c9b-0f2a-4409-b70c-52f4f67e8f39','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','c92c3704-a2ce-45fe-ad6e-c8143d6bad6c','::1','node','2026-11-06 06:59:47.612','2026-10-30 06:59:47.615'),
('1b23022c-cd40-45d9-a4a4-59d7deacd1ce','f19dbee1e1c949a3269d7f811aaa5164a5243e684126d64d92cf49919a47d775','7f7ad8f0-52ed-4f08-abc6-60c0c7193c9d','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','6aa0d05b-fbbf-4ba4-bb51-55da9741af09','::1','node','2026-11-06 06:59:48.100','2026-10-30 06:59:48.102'),
('234b6382-a82e-49ee-b02f-5cd74f08329d','b2787a53659b168c5f0f477b5b634752d0882828fbbae847fa565bc428696531','44601d6e-d03f-4d20-9c3d-d1f58ade1192','c2b7949b-dd30-47cf-9d04-c2062240278f','c528369c-e28b-489a-8ab3-4ae3879aca13','::1','node','2026-11-06 06:59:47.768','2026-10-30 06:59:47.771'),
('28828c77-b407-48a0-82b6-1de6f77ffab9','ef71d56235f45b859aa24b1050100414264eeaa512340a1fcc9227fcdd55acf1','c52b60aa-1170-42f3-97a4-9110aa124c79','8378e480-a786-4700-a328-900ec83a3a77','f5d826ee-dae5-4a3b-9bab-daf528a2f852','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0','2026-11-06 07:20:36.511','2026-10-30 07:20:36.513'),
('3a3e9796-b695-4277-b2c2-76d59ffb9f60','1a24ff85a8b24393dc84ca413d129d00777e0b1cf303b5c976e4900a281ad1af','6a89745b-4119-4d23-84f7-fb8eb8ba1eee','8297bbf8-4101-473d-a2e5-267f06286bef','d63d3c8c-e540-4240-8d43-d793bb0ed546','::1','node','2026-11-06 06:59:47.828','2026-10-30 06:59:47.830'),
('3a73c632-5ca0-40b0-bc41-72aa7429525e','a7999265bee1ea7d53cac9fac8961df06254406187930d15c8a305bb224e81c8','439a6f99-ca21-4e61-8993-86624ab0a8f0','505ffc4c-398e-471a-8547-80e5016e1c23','14ade0d8-8baa-4836-86ed-7092860c45d6','::1','node','2026-11-06 06:59:48.210','2026-10-30 06:59:48.212'),
('4ae2aa38-268e-4e42-9099-70e7dac69eaa','09fee03a4de8ba478bac07b0abf7e4580d9f5bb090dc67d4dc5ff788ad1c7080','e0a387f8-59f0-4374-ad6f-87b8bc067979',NULL,NULL,'::1','node','2026-11-06 06:59:47.545','2026-10-30 06:59:47.548'),
('578b9aeb-0f61-4b10-98ae-635d08ab5f53','c4d4f6277a494c0e748895a7139d50e144474dd0ece05bb0c65da8a060171d66','dbcb1254-7d48-44d1-8758-5c980e73d58b','6c52f25b-187b-48a1-a909-dbe5a961561c','679a151e-ff46-423c-ba34-236c3f189be4','::1','node','2026-11-06 06:59:47.917','2026-10-30 06:59:47.919'),
('766ff2f0-e0a8-43bf-a482-b86bc6cafb3a','ffa9709f14df2615115c219ac62e99422d916eea8c4a8373438fadeee9d6ed54','626ae0c2-76e8-4bb5-9216-41cc27f88486','6c52f25b-187b-48a1-a909-dbe5a961561c','679a151e-ff46-423c-ba34-236c3f189be4','::1','node','2026-11-06 06:59:47.968','2026-10-30 06:59:47.970'),
('928a3980-0a8f-4daf-bcab-e77c9f673a66','10baeb1ff4065ae1a5826cbe53a0caca1ad969b2e1d86fc66aabfe0e3abde3ce','e4fbf10a-1012-43a8-aa3d-207e7fbc253c','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','c92c3704-a2ce-45fe-ad6e-c8143d6bad6c','::1','node','2026-11-06 06:59:47.665','2026-10-30 06:59:47.667'),
('94244c61-25b5-49f2-aa67-65ddd25b1ae4','0e145c388120ba2d81497e9b78fa14c906d452bbb24964021f10f2040c999e19','da7a7e9f-1666-4717-944e-ac4490530e9f','505ffc4c-398e-471a-8547-80e5016e1c23','14ade0d8-8baa-4836-86ed-7092860c45d6','::1','node','2026-11-06 06:59:48.259','2026-10-30 06:59:48.262'),
('b2681ba8-0306-4951-9d27-87d7bb50f45f','adb7a308c6dc87da5720029d8debab91e00a35863f41a193fa28842c61e2f779','1011adbd-9744-4941-b3c1-b5125340af27','8297bbf8-4101-473d-a2e5-267f06286bef','d63d3c8c-e540-4240-8d43-d793bb0ed546','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0','2026-11-06 07:18:53.840','2026-10-30 07:18:53.843'),
('e864ae17-f754-4a22-aa68-02ce5ca9a6c1','378fc98fc787c135ad9bcba967b2b9f1100abaf880731729f2fdd7a7545fcc04','5e7b51e7-04c9-432b-b27f-7d16581f9b3e','c2b7949b-dd30-47cf-9d04-c2062240278f','c528369c-e28b-489a-8ab3-4ae3879aca13','::1','node','2026-11-06 06:59:47.708','2026-10-30 06:59:47.710'),
('e95572ff-f6cc-4aa2-94eb-a316062cd723','c0d767ebe32a0c45f0e77996d1d528128f2c2bbaf872949234de79a4ed49f3da','caed1bc4-0837-4af1-af5d-a947ec18c7f2','ef520599-7256-4dc1-98b5-ba69ecc3e080','2d90e014-db88-462c-85cf-f40ecbb8da91','::1','node','2026-11-06 06:59:48.295','2026-10-30 06:59:48.298'),
('eb726cc4-de50-4f26-917f-56ff5f372a59','94d3a774581059780bb31dae79df28fb835cda4614143b0dd788359dab138a90','b29b5280-8565-4b4a-95d0-27069354a452','ef520599-7256-4dc1-98b5-ba69ecc3e080','2d90e014-db88-462c-85cf-f40ecbb8da91','::1','node','2026-11-06 06:59:48.348','2026-10-30 06:59:48.351'),
('f3b9907f-5dfb-45fc-85d2-217279b91192','1241e9d94a9a134c9648ddf9d0bb63e947519b76fad024e79df4af66e98aa163','0a4a23ef-0e95-4975-9fa4-79bd67b0c351','8378e480-a786-4700-a328-900ec83a3a77','f5d826ee-dae5-4a3b-9bab-daf528a2f852','::1','node','2026-11-06 06:59:48.049','2026-10-30 06:59:48.051'),
('f92a2df7-51b3-4c0e-8014-60fc2c19f3d1','55ab3825f3e17ad1bfec3de72f28e866700911391020b9e2ea3f9d1acc16ac55','c52b60aa-1170-42f3-97a4-9110aa124c79','8378e480-a786-4700-a328-900ec83a3a77','f5d826ee-dae5-4a3b-9bab-daf528a2f852','::1','node','2026-11-06 06:59:48.012','2026-10-30 06:59:48.014'),
('fa56eed3-bc56-4d79-ba82-a5d54d0bc02e','6204693e8c17db57b148e1c1989179f65cdc8a3fcaf684540d59fcdfdd9a6dc8','1011adbd-9744-4941-b3c1-b5125340af27','8297bbf8-4101-473d-a2e5-267f06286bef','d63d3c8c-e540-4240-8d43-d793bb0ed546','::1','node','2026-11-06 06:59:47.871','2026-10-30 06:59:47.873');
/*!40000 ALTER TABLE `session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription`
--

DROP TABLE IF EXISTS `subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription` (
  `id` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `planId` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'TRIAL',
  `trialStartDate` datetime(3) DEFAULT NULL,
  `trialEndDate` datetime(3) DEFAULT NULL,
  `currentPeriodStart` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `currentPeriodEnd` datetime(3) NOT NULL,
  `cancelledAt` datetime(3) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Subscription_businessId_idx` (`businessId`),
  KEY `Subscription_status_idx` (`status`),
  KEY `Subscription_planId_fkey` (`planId`),
  CONSTRAINT `Subscription_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Subscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `subscriptionplan` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription`
--

LOCK TABLES `subscription` WRITE;
/*!40000 ALTER TABLE `subscription` DISABLE KEYS */;
INSERT INTO `subscription` VALUES
('sub-t2g-bakery','8297bbf8-4101-473d-a2e5-267f06286bef','92b7b6a5-5566-4af4-88c7-3717d4bbbf5b','ACTIVE',NULL,NULL,'2026-10-30 06:59:18.289','2027-10-30 06:59:18.289',NULL,NULL,'2026-10-30 06:59:18.291','2026-10-30 06:59:18.291'),
('sub-t2g-cafe','c2b7949b-dd30-47cf-9d04-c2062240278f','92b7b6a5-5566-4af4-88c7-3717d4bbbf5b','ACTIVE',NULL,NULL,'2026-10-30 06:59:18.201','2027-10-30 06:59:18.201',NULL,NULL,'2026-10-30 06:59:18.203','2026-10-30 06:59:18.203'),
('sub-t2g-fashion','8378e480-a786-4700-a328-900ec83a3a77','92b7b6a5-5566-4af4-88c7-3717d4bbbf5b','ACTIVE',NULL,NULL,'2026-10-30 06:59:18.459','2027-10-30 06:59:18.459',NULL,NULL,'2026-10-30 06:59:18.461','2026-10-30 06:59:18.461'),
('sub-t2g-grocery','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','92b7b6a5-5566-4af4-88c7-3717d4bbbf5b','ACTIVE',NULL,NULL,'2026-10-30 06:59:18.079','2027-10-30 06:59:18.079',NULL,NULL,'2026-10-30 06:59:18.081','2026-10-30 06:59:18.081'),
('sub-t2g-pharm','6c52f25b-187b-48a1-a909-dbe5a961561c','92b7b6a5-5566-4af4-88c7-3717d4bbbf5b','ACTIVE',NULL,NULL,'2026-10-30 06:59:18.379','2027-10-30 06:59:18.379',NULL,NULL,'2026-10-30 06:59:18.381','2026-10-30 06:59:18.381'),
('sub-t2g-salon','ef520599-7256-4dc1-98b5-ba69ecc3e080','92b7b6a5-5566-4af4-88c7-3717d4bbbf5b','ACTIVE',NULL,NULL,'2026-10-30 06:59:18.729','2027-10-30 06:59:18.729',NULL,NULL,'2026-10-30 06:59:18.731','2026-10-30 06:59:18.731'),
('sub-t2g-tech','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','92b7b6a5-5566-4af4-88c7-3717d4bbbf5b','ACTIVE',NULL,NULL,'2026-10-30 06:59:18.564','2027-10-30 06:59:18.564',NULL,NULL,'2026-10-30 06:59:18.566','2026-10-30 06:59:18.566'),
('sub-t2g-wholesale','505ffc4c-398e-471a-8547-80e5016e1c23','92b7b6a5-5566-4af4-88c7-3717d4bbbf5b','ACTIVE',NULL,NULL,'2026-10-30 06:59:18.654','2027-10-30 06:59:18.654',NULL,NULL,'2026-10-30 06:59:18.656','2026-10-30 06:59:18.656');
/*!40000 ALTER TABLE `subscription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptionplan`
--

DROP TABLE IF EXISTS `subscriptionplan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptionplan` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `monthlyPriceLkr` double NOT NULL DEFAULT 0,
  `yearlyPriceLkr` double NOT NULL DEFAULT 0,
  `maxProducts` int(11) NOT NULL DEFAULT 100,
  `maxEmployees` int(11) NOT NULL DEFAULT 2,
  `maxBranches` int(11) NOT NULL DEFAULT 1,
  `maxMonthlyInvoices` int(11) NOT NULL DEFAULT 500,
  `hasAdvancedReports` tinyint(1) NOT NULL DEFAULT 0,
  `hasBarcodePrinting` tinyint(1) NOT NULL DEFAULT 1,
  `hasMultiBranch` tinyint(1) NOT NULL DEFAULT 0,
  `hasWhatsAppAlerts` tinyint(1) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `SubscriptionPlan_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptionplan`
--

LOCK TABLES `subscriptionplan` WRITE;
/*!40000 ALTER TABLE `subscriptionplan` DISABLE KEYS */;
INSERT INTO `subscriptionplan` VALUES
('92b7b6a5-5566-4af4-88c7-3717d4bbbf5b','All-in-One Unlimited','UNLIMITED','Complete unrestricted access with unlimited products, staff, branches, and monthly invoices.',4999,49990,999999,999999,999999,999999,1,1,1,1,1,'2026-10-30 06:56:12.140');
/*!40000 ALTER TABLE `subscriptionplan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier` (
  `id` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `branchId` varchar(191) DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `contactPerson` varchar(191) DEFAULT NULL,
  `phone` varchar(191) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `outstandingBalance` double NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Supplier_businessId_name_idx` (`businessId`,`name`),
  KEY `Supplier_branchId_idx` (`branchId`),
  CONSTRAINT `Supplier_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Supplier_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier`
--

LOCK TABLES `supplier` WRITE;
/*!40000 ALTER TABLE `supplier` DISABLE KEYS */;
INSERT INTO `supplier` VALUES
('sup-t2g-bakery','8297bbf8-4101-473d-a2e5-267f06286bef','d63d3c8c-e540-4240-8d43-d793bb0ed546','Prima Flour & Bakery Supplies','Lalith Gamage','0112345003',NULL,NULL,NULL,0,'2026-10-30 06:59:18.314','2026-10-30 06:59:18.314'),
('sup-t2g-cafe','c2b7949b-dd30-47cf-9d04-c2062240278f','c528369c-e28b-489a-8ab3-4ae3879aca13','Lanka Wholesale Meat & Fresh Veggies','Sujith De Mel','0112345002',NULL,NULL,NULL,0,'2026-10-30 06:59:18.239','2026-10-30 06:59:18.239'),
('sup-t2g-fashion','8378e480-a786-4700-a328-900ec83a3a77','f5d826ee-dae5-4a3b-9bab-daf528a2f852','Lanka Apparel & Textiles Garments','Duminda Abeyrathne','0112345005',NULL,NULL,NULL,0,'2026-10-30 06:59:18.518','2026-10-30 06:59:18.518'),
('sup-t2g-grocery','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','c92c3704-a2ce-45fe-ad6e-c8143d6bad6c','Ceylon FMCG Distributors Ltd','Mohamed Rameez','0112345001',NULL,NULL,NULL,0,'2026-10-30 06:59:18.124','2026-10-30 06:59:18.124'),
('sup-t2g-pharm','6c52f25b-187b-48a1-a909-dbe5a961561c','679a151e-ff46-423c-ba34-236c3f189be4','State Pharmaceuticals Corporation / Hemas Health','Gayan Karunaratne','0112345004',NULL,NULL,NULL,0,'2026-10-30 06:59:18.410','2026-10-30 06:59:18.410'),
('sup-t2g-salon','ef520599-7256-4dc1-98b5-ba69ecc3e080','2d90e014-db88-462c-85cf-f40ecbb8da91','L\'Oreal & Professional Salon Cosmetics','Shalini Fonseka','0112345008',NULL,NULL,NULL,0,'2026-10-30 06:59:18.757','2026-10-30 06:59:18.757'),
('sup-t2g-tech','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','6aa0d05b-fbbf-4ba4-bb51-55da9741af09','Singer / Abans Tech Authorized Distributors','Heshan Jayasuriya','0112345006',NULL,NULL,NULL,0,'2026-10-30 06:59:18.592','2026-10-30 06:59:18.592'),
('sup-t2g-wholesale','505ffc4c-398e-471a-8547-80e5016e1c23','14ade0d8-8baa-4836-86ed-7092860c45d6','Tokyo Cement PLC & S-lon Manufacturing','Chathura Wickramasekara','0112345007',NULL,NULL,NULL,0,'2026-10-30 06:59:18.690','2026-10-30 06:59:18.690');
/*!40000 ALTER TABLE `supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `loginId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `passwordHash` varchar(191) NOT NULL,
  `isTemporaryPassword` tinyint(1) NOT NULL DEFAULT 1,
  `platformRole` varchar(191) NOT NULL DEFAULT 'USER',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `lastLoginAt` datetime(3) DEFAULT NULL,
  `failedLoginAttempts` int(11) NOT NULL DEFAULT 0,
  `lockedUntil` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_loginId_key` (`loginId`),
  KEY `User_loginId_idx` (`loginId`),
  KEY `User_phone_idx` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES
('0a4a23ef-0e95-4975-9fa4-79bd67b0c351','EMP-FASHION','Praveen Rathnayake','0775550002','emp-fashion@lankapos.lk','$2b$12$SwpuN9lB5.1dx60I77Jf7..t2xNa6G7KV70reVahcC/kw5fP0iyT6',0,'USER',1,NULL,0,NULL,'2026-10-30 06:59:18.472','2026-10-30 06:59:18.472'),
('1011adbd-9744-4941-b3c1-b5125340af27','EMP-BAKERY','Ruwan Silva','0773330002','emp-bakery@lankapos.lk','$2b$12$SwpuN9lB5.1dx60I77Jf7..t2xNa6G7KV70reVahcC/kw5fP0iyT6',0,'USER',1,NULL,0,NULL,'2026-10-30 06:59:18.302','2026-10-30 06:59:18.302'),
('439a6f99-ca21-4e61-8993-86624ab0a8f0','OWN-WHOLESALE','Ranjith Alwis','0777770001','own-wholesale@lankapos.lk','$2b$12$SwpuN9lB5.1dx60I77Jf7..t2xNa6G7KV70reVahcC/kw5fP0iyT6',0,'USER',1,NULL,0,NULL,'2026-10-30 06:59:18.669','2026-10-30 06:59:18.669'),
('44601d6e-d03f-4d20-9c3d-d1f58ade1192','EMP-CAFE','Dinesh Bandara','0772220002','emp-cafe@lankapos.lk','$2b$12$SwpuN9lB5.1dx60I77Jf7..t2xNa6G7KV70reVahcC/kw5fP0iyT6',0,'USER',1,NULL,0,NULL,'2026-10-30 06:59:18.225','2026-10-30 06:59:18.225'),
('46fd6a4c-77a7-46d5-9718-ee013cd9ab76','EMP-TECH','Nuwan Kumara','0776660002','emp-tech@lankapos.lk','$2b$12$SwpuN9lB5.1dx60I77Jf7..t2xNa6G7KV70reVahcC/kw5fP0iyT6',0,'USER',1,NULL,0,NULL,'2026-10-30 06:59:18.578','2026-10-30 06:59:18.578'),
('5e7b51e7-04c9-432b-b27f-7d16581f9b3e','OWN-CAFE','Nimal Fernando','0772220001','own-cafe@lankapos.lk','$2b$12$SwpuN9lB5.1dx60I77Jf7..t2xNa6G7KV70reVahcC/kw5fP0iyT6',0,'USER',1,NULL,0,NULL,'2026-10-30 06:59:18.218','2026-10-30 06:59:18.218'),
('626ae0c2-76e8-4bb5-9216-41cc27f88486','EMP-PHARM','Sanduni Wickramasinghe','0774440002','emp-pharm@lankapos.lk','$2b$12$SwpuN9lB5.1dx60I77Jf7..t2xNa6G7KV70reVahcC/kw5fP0iyT6',0,'USER',1,NULL,0,NULL,'2026-10-30 06:59:18.394','2026-10-30 06:59:18.394'),
('6a89745b-4119-4d23-84f7-fb8eb8ba1eee','OWN-BAKERY','Chamal Perera','0773330001','own-bakery@lankapos.lk','$2b$12$SwpuN9lB5.1dx60I77Jf7..t2xNa6G7KV70reVahcC/kw5fP0iyT6',0,'USER',1,NULL,0,NULL,'2026-10-30 06:59:18.296','2026-10-30 06:59:18.296'),
('7f7ad8f0-52ed-4f08-abc6-60c0c7193c9d','OWN-TECH','Sahan Gunasekara','0776660001','own-tech@lankapos.lk','$2b$12$SwpuN9lB5.1dx60I77Jf7..t2xNa6G7KV70reVahcC/kw5fP0iyT6',0,'USER',1,NULL,0,NULL,'2026-10-30 06:59:18.571','2026-10-30 06:59:18.571'),
('b29b5280-8565-4b4a-95d0-27069354a452','EMP-SALON','Roshan Mendis','0778880002','emp-salon@lankapos.lk','$2b$12$SwpuN9lB5.1dx60I77Jf7..t2xNa6G7KV70reVahcC/kw5fP0iyT6',0,'USER',1,NULL,0,NULL,'2026-10-30 06:59:18.747','2026-10-30 06:59:18.747'),
('c52b60aa-1170-42f3-97a4-9110aa124c79','OWN-FASHION','Malini Wijesinghe','0775550001','own-fashion@lankapos.lk','$2b$12$SwpuN9lB5.1dx60I77Jf7..t2xNa6G7KV70reVahcC/kw5fP0iyT6',0,'USER',1,NULL,0,NULL,'2026-10-30 06:59:18.466','2026-10-30 06:59:18.466'),
('caed1bc4-0837-4af1-af5d-a947ec18c7f2','OWN-SALON','Ayesha De Silva','0778880001','own-salon@lankapos.lk','$2b$12$SwpuN9lB5.1dx60I77Jf7..t2xNa6G7KV70reVahcC/kw5fP0iyT6',0,'USER',1,NULL,0,NULL,'2026-10-30 06:59:18.736','2026-10-30 06:59:18.736'),
('da7a7e9f-1666-4717-944e-ac4490530e9f','EMP-WHOLESALE','Kavinda Thilakarathne','0777770002','emp-wholesale@lankapos.lk','$2b$12$SwpuN9lB5.1dx60I77Jf7..t2xNa6G7KV70reVahcC/kw5fP0iyT6',0,'USER',1,NULL,0,NULL,'2026-10-30 06:59:18.676','2026-10-30 06:59:18.676'),
('dbcb1254-7d48-44d1-8758-5c980e73d58b','OWN-PHARM','Dr. Anura Senanayake','0774440001','own-pharm@lankapos.lk','$2b$12$SwpuN9lB5.1dx60I77Jf7..t2xNa6G7KV70reVahcC/kw5fP0iyT6',0,'USER',1,NULL,0,NULL,'2026-10-30 06:59:18.387','2026-10-30 06:59:18.387'),
('dd7d8c9b-0f2a-4409-b70c-52f4f67e8f39','OWN-GROCERY','Sunil Perera','0771110001','own-grocery@lankapos.lk','$2b$12$SwpuN9lB5.1dx60I77Jf7..t2xNa6G7KV70reVahcC/kw5fP0iyT6',0,'USER',1,NULL,0,NULL,'2026-10-30 06:59:18.094','2026-10-30 06:59:18.094'),
('e0a387f8-59f0-4374-ad6f-87b8bc067979','ADMIN-0001','SaaS Super Admin','0704022301','admin@ticket2grow.lk','$2b$12$SvXQJ.TZcyOmP7aWr5dl2uDnaQE0Fy3Cta177LmMl8MYZ7BtvsKHq',0,'SUPER_ADMIN',1,NULL,0,NULL,'2026-10-30 06:56:12.517','2026-10-30 06:56:12.517'),
('e4fbf10a-1012-43a8-aa3d-207e7fbc253c','EMP-GROCERY','Kasun Jayasuriya','0771110002','emp-grocery@lankapos.lk','$2b$12$SwpuN9lB5.1dx60I77Jf7..t2xNa6G7KV70reVahcC/kw5fP0iyT6',0,'USER',1,NULL,0,NULL,'2026-10-30 06:59:18.106','2026-10-30 06:59:18.106');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userbranch`
--

DROP TABLE IF EXISTS `userbranch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `userbranch` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `branchId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UserBranch_userId_branchId_key` (`userId`,`branchId`),
  KEY `UserBranch_branchId_idx` (`branchId`),
  CONSTRAINT `UserBranch_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserBranch_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userbranch`
--

LOCK TABLES `userbranch` WRITE;
/*!40000 ALTER TABLE `userbranch` DISABLE KEYS */;
INSERT INTO `userbranch` VALUES
('160c1959-0726-4bce-92f3-105b94f9ca00','b29b5280-8565-4b4a-95d0-27069354a452','2d90e014-db88-462c-85cf-f40ecbb8da91','2026-10-30 06:59:18.750'),
('217a35e8-6b03-4495-af10-72a920e38a84','1011adbd-9744-4941-b3c1-b5125340af27','d63d3c8c-e540-4240-8d43-d793bb0ed546','2026-10-30 06:59:18.305'),
('2784fec3-1536-411c-a43a-e883c663d2d9','6a89745b-4119-4d23-84f7-fb8eb8ba1eee','d63d3c8c-e540-4240-8d43-d793bb0ed546','2026-10-30 06:59:18.300'),
('49019059-1978-4840-8d7c-4a6ede12247e','46fd6a4c-77a7-46d5-9718-ee013cd9ab76','6aa0d05b-fbbf-4ba4-bb51-55da9741af09','2026-10-30 06:59:18.583'),
('7c901a93-a765-4bb1-a5d0-bb2b20ab775b','da7a7e9f-1666-4717-944e-ac4490530e9f','14ade0d8-8baa-4836-86ed-7092860c45d6','2026-10-30 06:59:18.681'),
('7fc12db4-d5e8-41ea-a5d0-570a5dc1a8d6','dd7d8c9b-0f2a-4409-b70c-52f4f67e8f39','c92c3704-a2ce-45fe-ad6e-c8143d6bad6c','2026-10-30 06:59:18.102'),
('8e7e33b6-7cbf-4082-a8e9-39ee490771e6','e4fbf10a-1012-43a8-aa3d-207e7fbc253c','c92c3704-a2ce-45fe-ad6e-c8143d6bad6c','2026-10-30 06:59:18.111'),
('8f087cf2-3bd0-4ed7-8007-febb04cfaa73','7f7ad8f0-52ed-4f08-abc6-60c0c7193c9d','6aa0d05b-fbbf-4ba4-bb51-55da9741af09','2026-10-30 06:59:18.576'),
('a0a759a3-8dba-4177-848e-58e69cc1042b','caed1bc4-0837-4af1-af5d-a947ec18c7f2','2d90e014-db88-462c-85cf-f40ecbb8da91','2026-10-30 06:59:18.745'),
('a50815e6-f3f5-482b-bd14-8d4f77d38598','626ae0c2-76e8-4bb5-9216-41cc27f88486','679a151e-ff46-423c-ba34-236c3f189be4','2026-10-30 06:59:18.399'),
('ac688ee3-8277-4d20-bd18-65d2d2752681','0a4a23ef-0e95-4975-9fa4-79bd67b0c351','f5d826ee-dae5-4a3b-9bab-daf528a2f852','2026-10-30 06:59:18.481'),
('c00ee34e-c791-4e1e-ae56-98d4f61ea710','dbcb1254-7d48-44d1-8758-5c980e73d58b','679a151e-ff46-423c-ba34-236c3f189be4','2026-10-30 06:59:18.392'),
('d2a1c4bc-d1ce-4631-8375-06c77232d8de','5e7b51e7-04c9-432b-b27f-7d16581f9b3e','c528369c-e28b-489a-8ab3-4ae3879aca13','2026-10-30 06:59:18.223'),
('dffb0297-9413-48c5-857c-73e010188e17','c52b60aa-1170-42f3-97a4-9110aa124c79','f5d826ee-dae5-4a3b-9bab-daf528a2f852','2026-10-30 06:59:18.470'),
('ee9ba4aa-6e43-492f-a375-f4907b9c2c75','439a6f99-ca21-4e61-8993-86624ab0a8f0','14ade0d8-8baa-4836-86ed-7092860c45d6','2026-10-30 06:59:18.674'),
('f848e791-6e4d-4c16-88ef-f74d75987e9d','44601d6e-d03f-4d20-9c3d-d1f58ade1192','c528369c-e28b-489a-8ab3-4ae3879aca13','2026-10-30 06:59:18.230');
/*!40000 ALTER TABLE `userbranch` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userbusiness`
--

DROP TABLE IF EXISTS `userbusiness`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `userbusiness` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'CASHIER',
  `isOwner` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UserBusiness_userId_businessId_key` (`userId`,`businessId`),
  KEY `UserBusiness_businessId_idx` (`businessId`),
  CONSTRAINT `UserBusiness_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserBusiness_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userbusiness`
--

LOCK TABLES `userbusiness` WRITE;
/*!40000 ALTER TABLE `userbusiness` DISABLE KEYS */;
INSERT INTO `userbusiness` VALUES
('0ae26daf-7c7e-4fb5-8225-85f07b436672','caed1bc4-0837-4af1-af5d-a947ec18c7f2','ef520599-7256-4dc1-98b5-ba69ecc3e080','BUSINESS_OWNER',1,'2026-10-30 06:59:18.743'),
('0b835efd-6116-49be-855b-b7881b725000','626ae0c2-76e8-4bb5-9216-41cc27f88486','6c52f25b-187b-48a1-a909-dbe5a961561c','CASHIER',0,'2026-10-30 06:59:18.396'),
('297f3f85-8013-451b-aee6-d57370cbaf0d','46fd6a4c-77a7-46d5-9718-ee013cd9ab76','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','CASHIER',0,'2026-10-30 06:59:18.581'),
('2e41e2eb-d6a1-463b-9193-0e96b2a1bebe','44601d6e-d03f-4d20-9c3d-d1f58ade1192','c2b7949b-dd30-47cf-9d04-c2062240278f','CASHIER',0,'2026-10-30 06:59:18.228'),
('30786545-3756-4bc0-ad41-542bf35a8fca','439a6f99-ca21-4e61-8993-86624ab0a8f0','505ffc4c-398e-471a-8547-80e5016e1c23','BUSINESS_OWNER',1,'2026-10-30 06:59:18.672'),
('340988a7-e7f4-48f8-bc81-e94b016cc89c','6a89745b-4119-4d23-84f7-fb8eb8ba1eee','8297bbf8-4101-473d-a2e5-267f06286bef','BUSINESS_OWNER',1,'2026-10-30 06:59:18.298'),
('3b70f724-0267-4352-adae-079712882f24','da7a7e9f-1666-4717-944e-ac4490530e9f','505ffc4c-398e-471a-8547-80e5016e1c23','CASHIER',0,'2026-10-30 06:59:18.679'),
('56669f83-a6c6-4cbd-864b-0041065cb0fe','dd7d8c9b-0f2a-4409-b70c-52f4f67e8f39','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','BUSINESS_OWNER',1,'2026-10-30 06:59:18.097'),
('967aabf5-e1a0-470c-b57e-fc43f176a197','e4fbf10a-1012-43a8-aa3d-207e7fbc253c','eb4527f6-1a7b-47a9-8dea-49fa8dd0b7be','CASHIER',0,'2026-10-30 06:59:18.109'),
('a7fbbcb5-f786-4404-b09b-d3180d6ba039','b29b5280-8565-4b4a-95d0-27069354a452','ef520599-7256-4dc1-98b5-ba69ecc3e080','CASHIER',0,'2026-10-30 06:59:18.749'),
('a8fe3e9d-4a26-40d1-96b1-aff42203f643','dbcb1254-7d48-44d1-8758-5c980e73d58b','6c52f25b-187b-48a1-a909-dbe5a961561c','BUSINESS_OWNER',1,'2026-10-30 06:59:18.389'),
('bab99cfc-f9a6-4532-9389-f87afe895b79','0a4a23ef-0e95-4975-9fa4-79bd67b0c351','8378e480-a786-4700-a328-900ec83a3a77','CASHIER',0,'2026-10-30 06:59:18.476'),
('bbcdd740-9a6d-4854-a22a-8c0d1f75c290','5e7b51e7-04c9-432b-b27f-7d16581f9b3e','c2b7949b-dd30-47cf-9d04-c2062240278f','BUSINESS_OWNER',1,'2026-10-30 06:59:18.221'),
('bd1da765-a22e-497b-8db1-66cc9f3c6969','c52b60aa-1170-42f3-97a4-9110aa124c79','8378e480-a786-4700-a328-900ec83a3a77','BUSINESS_OWNER',1,'2026-10-30 06:59:18.468'),
('bec4ce6c-8410-4e59-8a81-7ffc43441a55','7f7ad8f0-52ed-4f08-abc6-60c0c7193c9d','ca781118-44a9-4de8-b4b8-5f500f9c2f1b','BUSINESS_OWNER',1,'2026-10-30 06:59:18.574'),
('f147e826-9d7e-482b-bb01-533908b10fe2','1011adbd-9744-4941-b3c1-b5125340af27','8297bbf8-4101-473d-a2e5-267f06286bef','CASHIER',0,'2026-10-30 06:59:18.304');
/*!40000 ALTER TABLE `userbusiness` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-30 12:56:31
