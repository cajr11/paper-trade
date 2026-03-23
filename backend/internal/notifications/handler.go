package notifications

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	appcontext "github.com/cajr11/paper-trade/backend/internal/context"
	"github.com/cajr11/paper-trade/backend/internal/store"
)

type NotificationHandler struct {
	store *store.NotificationStore
}

func NewNotificationHandler(store *store.NotificationStore) *NotificationHandler {
	return &NotificationHandler{store: store}
}

func (h *NotificationHandler) HandleGetNotifications(w http.ResponseWriter, r *http.Request) {
	userID := appcontext.GetUserID(r.Context())

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	notifications, err := h.store.GetByUserID(r.Context(), userID, limit, offset)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to fetch notifications"})
		return
	}

	if notifications == nil {
		notifications = []store.Notification{}
	}

	writeJSON(w, http.StatusOK, notifications)
}

func (h *NotificationHandler) HandleMarkAsRead(w http.ResponseWriter, r *http.Request) {
	userID := appcontext.GetUserID(r.Context())
	notificationID := chi.URLParam(r, "id")

	if notificationID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "notification id is required"})
		return
	}

	if err := h.store.MarkAsRead(r.Context(), userID, notificationID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to mark notification as read"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "marked as read"})
}

func (h *NotificationHandler) HandleGetUnreadCount(w http.ResponseWriter, r *http.Request) {
	userID := appcontext.GetUserID(r.Context())

	count, err := h.store.GetUnreadCount(r.Context(), userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to get unread count"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"count": count})
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
