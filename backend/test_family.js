import { UserService } from './src/services/userService.js';

async function test() {
  const service = new UserService();
  try {
    const user = await service.createUser({ role: 'family', fatherName: 'Ahmad', phone: '0780000000' });
    console.log('Created user:', user);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();