CREATE TABLE `auditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`resourceType` varchar(100),
	`resourceId` int,
	`details` json,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creditTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`amount` int NOT NULL,
	`type` enum('purchase','usage','refund','monthly_grant') NOT NULL,
	`description` text,
	`balanceBefore` int NOT NULL,
	`balanceAfter` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `creditTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scenes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`sceneNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`narrationText` longtext NOT NULL,
	`illustrationKeywords` json DEFAULT ('[]'),
	`duration` int DEFAULT 5,
	`animationStyle` enum('stroke-reveal','fade-in','slide-in') DEFAULT 'stroke-reveal',
	`svgUrl` varchar(512),
	`svgStorageKey` varchar(512),
	`narrationAudioUrl` varchar(512),
	`narrationAudioStorageKey` varchar(512),
	`narrationDuration` int,
	`status` enum('draft','generating','ready','failed') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scenes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptionPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tier` enum('free','starter','creator','growth') NOT NULL,
	`monthlyPrice` decimal(10,2) DEFAULT '0',
	`yearlyPrice` decimal(10,2) DEFAULT '0',
	`videosPerMonth` int DEFAULT 0,
	`creditsPerMonth` int DEFAULT 0,
	`allowWatermarkRemoval` boolean DEFAULT false,
	`allowAllStyles` boolean DEFAULT false,
	`maxVideoLength` int DEFAULT 300,
	`features` json DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptionPlans_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptionPlans_tier_unique` UNIQUE(`tier`)
);
--> statement-breakpoint
CREATE TABLE `svgAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`keywords` json DEFAULT ('[]'),
	`svgContent` longtext NOT NULL,
	`svgUrl` varchar(512),
	`storageKey` varchar(512),
	`animationPresets` json DEFAULT ('[]'),
	`isCustom` boolean DEFAULT false,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `svgAssets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uploadedDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`filename` varchar(255) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`fileSize` int NOT NULL,
	`storageUrl` varchar(512) NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`extractedText` longtext,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `uploadedDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videoProjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`whiteboardStyle` enum('sketch','canvas','chalkboard') NOT NULL DEFAULT 'sketch',
	`voiceStyle` enum('male','female') NOT NULL DEFAULT 'male',
	`status` enum('draft','generating','ready','exported','failed') NOT NULL DEFAULT 'draft',
	`videoUrl` varchar(512),
	`videoStorageKey` varchar(512),
	`duration` int,
	`creditsUsed` int DEFAULT 0,
	`includeWatermark` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `videoProjects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionTier` enum('free','starter','creator','growth') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `creditsBalance` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `creditsUsedThisMonth` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStartDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionEndDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('active','cancelled','expired') DEFAULT 'active';