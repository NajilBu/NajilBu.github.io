import cv2
import mediapipe as mp
import time

cap = cv2.VideoCapture(0)



while True:
    success, img = cap.read()

    img = cv2.flip(img, 1)

    cv2.imshow("Image", img)
    cv2.waitKey(1)