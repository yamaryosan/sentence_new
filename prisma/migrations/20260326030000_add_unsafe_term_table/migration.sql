-- CreateTable
CREATE TABLE `UnsafeTerm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `term` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UnsafeTerm_term_key`(`term`),
    PRIMARY KEY (`id`)
);
