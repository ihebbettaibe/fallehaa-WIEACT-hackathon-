/*
  Warnings:

  - You are about to drop the column `creatorId` on the `Investment` table. All the data in the column will be lost.
  - You are about to drop the column `posterId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Backing` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `backings` to the `Investment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creator` to the `Investment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `poster` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Backing" DROP CONSTRAINT "Backing_investmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Backing" DROP CONSTRAINT "Backing_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Investment" DROP CONSTRAINT "Investment_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Job" DROP CONSTRAINT "Job_posterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_ownerId_fkey";

-- AlterTable
ALTER TABLE "public"."Investment" DROP COLUMN "creatorId",
ADD COLUMN     "backings" JSONB NOT NULL,
ADD COLUMN     "creator" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "public"."Job" DROP COLUMN "posterId",
ADD COLUMN     "poster" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "ownerId",
ADD COLUMN     "owner" JSONB NOT NULL;

-- DropTable
DROP TABLE "public"."Backing";
