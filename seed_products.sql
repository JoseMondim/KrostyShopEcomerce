-- Insert Dummy Products
INSERT INTO products (name, description, price, image_url, category, stock_status)
VALUES 
  (
    'Steam Gift Card $20', 
    'Recarga tu saldo de Steam al instante. Código digital válido para cuentas de región Global/USA.', 
    20.00, 
    'https://images.unsplash.com/photo-1606166325969-9226cb582d24?q=80&w=1000&auto=format&fit=crop', 
    'Juegos', 
    'in_stock'
  ),
  (
    'PlayStation Store $50', 
    'Compra juegos, complementos y películas en PS Store. Compatible con PS4 y PS5.', 
    50.00, 
    'https://images.unsplash.com/photo-1606144042614-b2413e99c03d?q=80&w=1000&auto=format&fit=crop', 
    'Consolas', 
    'in_stock'
  ),
  (
    'Free Fire 100 Diamantes', 
    'Recarga de diamantes para Free Fire. Entrega inmediata mediante ID de jugador.', 
    1.20, 
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop', 
    'Juegos Móviles', 
    'in_stock'
  ),
  (
    'Xbox Game Pass Ultimate - 1 Mes', 
    'Acceso a más de 100 juegos de alta calidad en consola, PC y la nube.', 
    15.00, 
    'https://images.unsplash.com/photo-1627856014759-2a01d6e2dd2e?q=80&w=1000&auto=format&fit=crop', 
    'Suscripciones', 
    'in_stock'
  ),
  (
    'Amazon Gift Card $100', 
    'La tarjeta de regalo ideal para cualquier ocasión. Válida en Amazon.com.', 
    100.00, 
    'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?q=80&w=1000&auto=format&fit=crop', 
    'Compras', 
    'low_stock'
  );
